import { useNavigate } from 'react-router-dom';
import { Shell, useCommonMenu } from '../components/Shell';
import { ANSWERS } from '../data';
import { useStore, type AnswerActions, type QuestionStyle } from '../store';

/** Index of every board in the design file, each opening the matching state of the app. */
export function Screens() {
  const nav = useNavigate();
  const { setDataset, setTurns, setSideOpen, setQuestionStyle, setAnswerActions } = useStore();

  const ask = (opts: { follow?: boolean; side?: boolean; q?: QuestionStyle; a?: AnswerActions }) => () => {
    setDataset('sales_data');
    setSideOpen(!!opts.side);
    setQuestionStyle(opts.q ?? 'avatar');
    setAnswerActions(opts.a ?? 'buttons');
    const now = Date.now();
    const turns = [{ key: 's1', answerId: ANSWERS[0].id, question: ANSWERS[0].question, followUp: false, at: opts.follow ? 0 : now }];
    if (opts.follow) turns.push({ key: 's2', answerId: ANSWERS[1].id, question: ANSWERS[1].question, followUp: true, at: now });
    setTurns(turns);
    nav('/ask');
  };

  const screens: { n: string; t: string; d: string; go: () => void }[] = [
    { n: '1', t: 'Landing — no data source', d: 'Composer disabled until data is chosen', go: () => { setDataset(null); setSideOpen(false); nav('/'); } },
    { n: '2', t: 'Landing — choose data source', d: 'Open the “Select data” menu in the composer', go: () => { setDataset(null); setSideOpen(false); nav('/'); } },
    { n: '3', t: 'Landing — suggested questions', d: 'sales_data selected, three suggested questions', go: () => { setDataset('sales_data'); setSideOpen(false); nav('/'); } },
    { n: 'Option 1', t: 'Data model — drawer', d: 'Semantic model drawer, opened from the composer', go: () => { setDataset('sales_data'); nav('/'); } },
    { n: '4', t: 'Ask AI — live trace, chart card, follow-ups', d: 'Watch the agent trace stream, then switch charts, filter and export', go: ask({}) },
    { n: '4b', t: 'Ask AI — follow-up answered', d: 'Scrolling chat with a second, follow-up answer', go: ask({ follow: true }) },
    { n: '5', t: 'Dashboard — All Pins', d: 'Card menus, copy to board, filters across datasets', go: () => nav('/dashboard') },
    { n: '6', t: 'Dashboard — Testing AI Sales board', d: 'Large charts with board-wide filters', go: () => nav('/dashboard/testing-ai-sales') },
    { n: '7', t: 'Data model — option 2: explorer page', d: 'Tables, metrics and glossary for each model', go: () => { setSideOpen(true); nav('/data-model'); } },
    { n: 'Option 3', t: 'Question style — icon chip', d: 'Question with icon and data chips, replayable trace', go: ask({ side: true, q: 'icon' }) },
    { n: 'Option C', t: 'Narrative — refreshed container', d: 'AI insights container with copy and feedback', go: ask({ side: true }) },
    { n: 'Option', t: 'Answer actions — ⋯ menu', d: 'Refresh and Export combined in one menu', go: ask({ a: 'menu' }) },
    { n: 'Spec', t: 'Narrative container — all content shapes', d: 'Bullets, paragraph, KPIs and mixed', go: () => nav('/narrative') },
  ];

  return (
    <Shell crumb="All screens" view={null} menu={useCommonMenu()}>
      <div className="gallery">
        <div>
          <h1>Akashic Insights (AI) — screens</h1>
          <p style={{ margin: '6px 0 0', color: 'var(--slate-600)', fontSize: 15 }}>Every board from the design, opened in the working app.</p>
        </div>
        <div className="gallery-grid">
          {screens.map((s) => (
            <button key={s.t} type="button" className="gallery-card" style={{ textAlign: 'left', font: 'inherit' }} onClick={s.go}>
              <span className="n">{s.n}</span>
              <span className="t">{s.t}</span>
              <span className="d">{s.d}</span>
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}
