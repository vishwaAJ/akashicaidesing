import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  AOV_BY_COUNTRY, COUNTRIES, DEAL_SIZES, PRODUCT_LINES, PRODUCT_LINES_2003, TOP_COUNTRY_QUARTERS, YEARS,
  type Answer, type ChartKind, type DatasetName, type Row,
} from './data';

export type PinViz = ChartKind | 'treemap' | 'donut' | 'hbars';

export interface PinItem {
  id: string;
  title: string;
  viz: PinViz;
  /** Visual used when the pin is shown large on a board. */
  boardViz?: PinViz;
  rows: Row[];
  dataset: DatasetName;
  fields: string[];
  board: string;
  /** Only shown on its board, not in All Pins. */
  boardOnly?: boolean;
  owner: 'Me' | 'Yash' | 'Shared with me';
  created: 'Today' | 'Last 7 days' | 'Last 30 days' | 'Last 90 days' | 'This year';
  narrative: string;
  filterTag?: string;
  color?: string;
  shortLabels?: string[];
  yLabel?: string;
  xLabel?: string;
  sourceAnswer?: string;
}

const SHORT_LINES = ['Classic', 'Vintage', 'Moto', 'Trucks', 'Planes', 'Ships', 'Trains'];

const INITIAL_PINS: PinItem[] = [
  {
    id: 'c1', title: 'Total Sales by Product Line', viz: 'column', rows: PRODUCT_LINES, dataset: 'sales_data',
    fields: ['Product line', 'Total Sales'], board: 'Testing AI Sales', owner: 'Me', created: 'Last 7 days', shortLabels: SHORT_LINES,
    narrative: 'Classic Cars lead with 3.92M, about 39% of all sales. Trains are the smallest line at 226K.',
    xLabel: 'product_line', yLabel: 'Total Sales',
  },
  {
    id: 'c2', title: 'Top Country by Sales per Quarter', viz: 'area', rows: TOP_COUNTRY_QUARTERS, dataset: 'video_game_sales',
    fields: ['Country', 'Quarter', 'Total Sales'], board: 'Yash Pins', owner: 'Yash', created: 'Last 30 days', color: '#D97706',
    narrative: 'The top country peaks every fourth quarter: 704.6K in late 2003 and 739.3K in late 2004.',
  },
  {
    id: 'c3', title: 'Total Sales by Country', viz: 'treemap', rows: COUNTRIES, dataset: 'sales_data',
    fields: ['Country', 'Total Sales'], board: 'Testing AI Sales', owner: 'Me', created: 'Today',
    narrative: 'The USA accounts for 36% of sales, more than Spain, France and Australia combined.',
  },
  {
    id: 'c4', title: 'Sales by Deal Size', viz: 'donut', rows: DEAL_SIZES, dataset: 'sales_data',
    fields: ['Deal size', 'Total Sales'], board: 'Sales Overview', owner: 'Me', created: 'Last 90 days',
    narrative: 'Medium deals make up 60.7% of the 10.03M total; Large deals only 13%.',
  },
  {
    id: 'c5', title: 'Total Sales by Year', viz: 'column', rows: YEARS.map((y) => ({ ...y, label: y.label.slice(0, 4) })), dataset: 'sales_data',
    fields: ['Year', 'Total Sales'], board: 'Sales Overview', owner: 'Me', created: 'This year',
    narrative: 'Sales grew 34% from 2003 to 2004. 2005 covers January to May only.',
    xLabel: 'year', yLabel: 'Total Sales',
  },
  {
    id: 'c6', title: 'Average Order Value by Country', viz: 'hbars', boardViz: 'column', rows: AOV_BY_COUNTRY, dataset: 'sales_data',
    fields: ['Country', 'Average Order Value'], board: 'Testing AI Sales', owner: 'Shared with me', created: 'Last 30 days',
    narrative: 'Denmark has the largest average order at 58.9K, ahead of Japan at 46.8K.',
    xLabel: 'country', yLabel: 'Average Order Value',
  },
  {
    id: 't2', title: 'Total Sales by Country', viz: 'donut', rows: COUNTRIES, dataset: 'sales_data', boardOnly: true,
    fields: ['Country', 'Total Sales'], board: 'Testing AI Sales', owner: 'Me', created: 'Today',
    narrative: 'Ten countries make up 86% of the 10.03M total; the other nine share 14.2%.',
  },
  {
    id: 't4', title: 'Total Sales by Product Line in 2003', viz: 'column', rows: PRODUCT_LINES_2003, dataset: 'sales_data', boardOnly: true,
    fields: ['Product line', 'Total Sales'], board: 'Testing AI Sales', owner: 'Me', created: 'Last 7 days', filterTag: 'Year: 2003',
    narrative: 'In 2003 Classic Cars brought in 1.48M, more than twice Vintage Cars.',
    xLabel: 'product_line', yLabel: 'Total Sales',
  },
];

export const BASE_BOARDS = ['Sales Overview', 'Yash Pins', 'Testing AI Sales'];

export interface Turn { key: string; answerId: string; question: string; followUp: boolean; at: number }

export type QuestionStyle = 'avatar' | 'icon';
export type AnswerActions = 'buttons' | 'menu';

interface Store {
  dataset: DatasetName | null;
  setDataset: (d: DatasetName | null) => void;
  sideOpen: boolean;
  setSideOpen: (v: boolean) => void;
  pins: PinItem[];
  boards: string[];
  pinAnswer: (a: Answer, rows: Row[], viz: ChartKind) => string;
  unpin: (id: string) => void;
  copyPin: (id: string, board: string) => void;
  createBoard: (name: string) => string;
  toast: string;
  flash: (msg: string) => void;
  questionStyle: QuestionStyle;
  setQuestionStyle: (s: QuestionStyle) => void;
  answerActions: AnswerActions;
  setAnswerActions: (s: AnswerActions) => void;
  turns: Turn[];
  setTurns: (t: Turn[] | ((t: Turn[]) => Turn[])) => void;
}

const Ctx = createContext<Store | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem('akashic:' + key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, v: unknown) {
  try {
    localStorage.setItem('akashic:' + key, JSON.stringify(v));
  } catch {
    /* storage unavailable */
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [dataset, setDataset] = useState<DatasetName | null>(null);
  const [sideOpen, setSideOpen] = useState<boolean>(() => load('side', false));
  const [pins, setPins] = useState<PinItem[]>(() => load('pins-v1', INITIAL_PINS));
  const [boards, setBoards] = useState<string[]>(() => load('boards', BASE_BOARDS));
  const [toast, setToast] = useState('');
  const [questionStyle, setQuestionStyle] = useState<QuestionStyle>('avatar');
  const [answerActions, setAnswerActions] = useState<AnswerActions>('buttons');
  const [turns, setTurns] = useState<Turn[]>([]);
  const timer = useRef<number>();

  useEffect(() => save('pins-v1', pins), [pins]);
  useEffect(() => save('boards', boards), [boards]);
  useEffect(() => save('side', sideOpen), [sideOpen]);

  const flash = useCallback((msg: string) => {
    window.clearTimeout(timer.current);
    setToast(msg);
    timer.current = window.setTimeout(() => setToast(''), 2600);
  }, []);

  const pinAnswer = useCallback((a: Answer, rows: Row[], viz: ChartKind) => {
    const id = 'p' + Date.now().toString(36);
    setPins((ps) => [
      {
        id, title: a.title, viz, rows, dataset: a.dataset, fields: [...a.columns, ...a.calcs], board: 'Uncategorized',
        owner: 'Me', created: 'Today', narrative: '', sourceAnswer: a.id, xLabel: a.dimKey, yLabel: a.measure,
      },
      ...ps,
    ]);
    return id;
  }, []);

  const unpin = useCallback((id: string) => setPins((ps) => ps.filter((p) => p.id !== id)), []);

  const copyPin = useCallback((id: string, board: string) => {
    setPins((ps) => {
      const src = ps.find((p) => p.id === id);
      if (!src) return ps;
      if (src.board === 'Uncategorized') return ps.map((p) => (p.id === id ? { ...p, board } : p));
      return [...ps, { ...src, id: id + '-' + Date.now().toString(36), board, boardOnly: true }];
    });
  }, []);

  const createBoard = useCallback((name: string) => {
    const n = name.trim() || 'Untitled board';
    setBoards((bs) => (bs.includes(n) ? bs : [...bs, n]));
    return n;
  }, []);

  const value = useMemo<Store>(
    () => ({
      dataset, setDataset, sideOpen, setSideOpen, pins, boards, pinAnswer, unpin, copyPin, createBoard, toast, flash,
      questionStyle, setQuestionStyle, answerActions, setAnswerActions, turns, setTurns,
    }),
    [dataset, sideOpen, pins, boards, pinAnswer, unpin, copyPin, createBoard, toast, flash, questionStyle, answerActions, turns],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside StoreProvider');
  return s;
}

export const boardSlug = (b: string) => b.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
