import { useMemo, useRef, useState } from 'react';
import { ANSWER_FILTERS, applyFilters, type Answer, type ChartKind, type DatasetName, type NarrativeBlock, type Row } from '../data';
import { compact } from '../format';
import { useStore } from '../store';
import { AgentTrace, useTrace } from './AgentTrace';
import { CartesianChart, DataTable, HBars } from './Charts';
import { AppliedFilters, FilterButton, type Filters } from './FilterPanel';
import {
  AreaIcon, BarIcon, ChatLines, ChevronDown, ColumnIcon, Columns, Database, Dots, Download, FollowUp, LineIcon, Logo, Refresh, Sparkle,
  TableIcon, ThumbDown, ThumbUp,
} from './Icons';
import { Narrative } from './Narrative';
import { Switch, useDismiss } from './ui';

const KINDS: { kind: ChartKind; label: string; Icon: typeof TableIcon }[] = [
  { kind: 'table', label: 'Table', Icon: TableIcon },
  { kind: 'column', label: 'Column chart', Icon: ColumnIcon },
  { kind: 'line', label: 'Line chart', Icon: LineIcon },
  { kind: 'area', label: 'Area chart', Icon: AreaIcon },
  { kind: 'bar', label: 'Bar chart', Icon: BarIcon },
];

const slug = (s: string) => s.toLowerCase().replace(/\(.*?\)/g, '').trim().replace(/[^a-z0-9]+/g, '_').replace(/_$/, '');

function filteredNarrative(rows: Row[], f: Filters): NarrativeBlock[] {
  const desc = Object.values(f).join(', ');
  if (!rows.length) return [{ kind: 'p', text: `No rows match ${desc}. Try removing a filter.` }];
  const total = rows.reduce((a, r) => a + r.value, 0);
  const sorted = [...rows].sort((a, b) => b.value - a.value);
  const top = sorted[0];
  const low = sorted[sorted.length - 1];
  const items = [`With ${desc} applied, ${top.label} leads with [[${compact(top.value)}]], about [[${Math.round((top.value / total) * 100)}%]] of the filtered total.`];
  if (sorted.length > 1) items.push(`${low.label} is the smallest at [[${compact(low.value)}]].`);
  items.push(`The filtered total is [[${compact(total)}]] across ${rows.length} rows.`);
  return [{ kind: 'bullets', items }];
}

function download(name: string, blob: Blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function AnswerCard({
  answer, live, followUp, latest, onAsk, onOpenModel,
}: {
  answer: Answer;
  live: boolean;
  followUp?: boolean;
  latest: boolean;
  onAsk: (q: string, dataset: DatasetName) => void;
  onOpenModel: () => void;
}) {
  const { pinAnswer, unpin, flash, questionStyle, answerActions } = useStore();
  const [kind, setKind] = useState<ChartKind>(answer.chart);
  const [narr, setNarr] = useState(true);
  const [panel, setPanel] = useState(true);
  const [pinId, setPinId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const [playLive] = useState(live);
  const trace = useTrace(answer.steps, playLive);
  const vizRef = useRef<HTMLDivElement>(null);
  const uid = useMemo(() => answer.id + '-' + Math.random().toString(36).slice(2, 7), [answer.id]);

  const rows = useMemo(() => applyFilters(answer.rows, filters, answer.dimKey), [answer, filters]);
  const filtered = Object.keys(filters).length > 0;
  const blocks = filtered ? filteredNarrative(rows, filters) : answer.narrative;
  const fmt = { digits: answer.digits, unit: answer.unit };
  const fileBase = slug(answer.title);
  const sqlText = answer.steps.find((s) => s.code)?.code ?? '';

  const togglePin = () => {
    if (pinId) {
      unpin(pinId);
      setPinId(null);
      flash('Chart unpinned from dashboard.');
    } else {
      setPinId(pinAnswer(answer, rows, kind));
      flash('Chart pinned to dashboard.');
    }
  };

  const exportAs = (type: 'png' | 'svg' | 'csv' | 'xlsx' | 'sql') => {
    const name = `${fileBase}.${type}`;
    if (type === 'csv') {
      const csv = [`${answer.dim},${answer.measure}`, ...rows.map((r) => `"${r.label}",${r.value}`)].join('\n');
      download(name, new Blob([csv], { type: 'text/csv' }));
      flash('Exporting ' + name);
      return;
    }
    if (type === 'sql') {
      try {
        void navigator.clipboard?.writeText(sqlText).catch(() => undefined);
      } catch {
        /* clipboard unavailable */
      }
      flash('SQL query copied to clipboard.');
      return;
    }
    const svg = vizRef.current?.querySelector('svg[role="img"]');
    if ((type === 'svg' || type === 'png') && svg) {
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('font-family', 'Inter, system-ui, sans-serif');
      const vb = clone.viewBox.baseVal;
      clone.setAttribute('width', String(vb.width));
      clone.setAttribute('height', String(vb.height));
      const text = new XMLSerializer().serializeToString(clone);
      if (type === 'svg') {
        download(name, new Blob([text], { type: 'image/svg+xml' }));
      } else {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement('canvas');
          c.width = vb.width * 2;
          c.height = vb.height * 2;
          const ctx = c.getContext('2d');
          if (!ctx) return;
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, c.width, c.height);
          ctx.scale(2, 2);
          ctx.drawImage(img, 0, 0);
          c.toBlob((b) => b && download(name, b), 'image/png');
        };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(text);
      }
      flash('Downloading ' + name);
      return;
    }
    flash((type === 'png' || type === 'svg' ? 'Downloading ' : 'Exporting ') + name);
  };

  const exportItems = [
    { group: 'Chart', title: 'Download image', sub: 'High resolution (2×), for decks and email', tag: 'PNG', run: () => exportAs('png') },
    { group: 'Chart', title: 'Download vector', sub: 'Sharp at any size, for print', tag: 'SVG', run: () => exportAs('svg') },
    { group: 'Data', title: 'Export data rows', sub: `${rows.length} rows · ${[...answer.columns, answer.calcs[0]].join(', ')}`, tag: 'CSV', run: () => exportAs('csv') },
    { group: 'Data', title: 'Export to Excel', sub: 'Same rows, ready to filter and pivot', tag: 'XLSX', run: () => exportAs('xlsx') },
    { group: 'Query', title: 'Copy SQL query', sub: `Executed on ${answer.dataset} · ${sqlText.split('\n').length} lines`, tag: 'SQL', run: () => exportAs('sql') },
  ];

  const chartNode = (() => {
    if (!rows.length) return <div className="empty"><h3>No data</h3>No rows match these filters.</div>;
    if (kind === 'table') return <DataTable rows={rows} dim={answer.dim} measure={answer.measure} format={fmt} />;
    if (kind === 'bar') return <HBars rows={rows} format={fmt} />;
    return (
      <CartesianChart
        rows={rows}
        kind={kind}
        yLabel={answer.measure}
        xLabel={kind === 'column' ? answer.dimKey : answer.dim}
        format={fmt}
        ariaLabel={`${KINDS.find((k) => k.kind === kind)?.label} of ${answer.title.toLowerCase()}`}
      />
    );
  })();

  return (
    <section className="turn" aria-label={followUp ? 'Follow-up answer' : 'Answer'}>
      <div>
        <div className="q-line">
          {questionStyle === 'avatar' ? (
            <span className="avatar-sm" title="Asked by Vishwanandan K" aria-label="Your question">VK</span>
          ) : (
            <span className="q-icon" aria-label="Your question"><ChatLines size={17} /></span>
          )}
          <h2 className="q-text">{answer.question}</h2>
          {followUp && <span className="q-tag">Follow-up</span>}
        </div>
        {questionStyle === 'icon' && (
          <div className="q-meta" style={{ marginTop: 8 }}>
            <span className="q-meta-chip"><Database size={13} style={{ color: 'var(--blue-600)' }} />{answer.dataset}</span>
            {followUp && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--slate-500)' }}><FollowUp size={14} />uses {answer.dataset} from your last question</span>}
            {[...answer.columns, ...answer.calcs].map((c) => <span key={c}>· {c}</span>)}
          </div>
        )}
      </div>

      <article className="answer">
        <div className="answer-head">
          <h3 className="answer-title">{answer.title}</h3>
          <div className="answer-tools">
            <Switch label="Narrative" checked={narr} onChange={() => setNarr(!narr)} />
            <Switch label="Pin" checked={!!pinId} onChange={togglePin} />
            <Switch label="Agent trace" checked={panel} onChange={() => setPanel(!panel)} controls={uid + '-trace'} />
            {answerActions === 'buttons' ? (
              <>
                <span className="tools-sep" aria-hidden="true" />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn sm" title="Run this question again" onClick={trace.replay}><Refresh size={14} />Refresh</button>
                  <ActionsMenu label="Export" title="Download or share this answer" items={exportItems} />
                </div>
              </>
            ) : (
              <ActionsMenu label="" title="More actions" items={exportItems} refresh={trace.replay} />
            )}
          </div>
        </div>

        {questionStyle === 'avatar' && (
          <div className="data-strip" role="group" aria-label="Data used">
            <span className="strip-label">Data</span>
            <button type="button" className="strip-link" title="View semantic model" onClick={onOpenModel}>{answer.dataset}</button>
            <span className="strip-sep" aria-hidden="true" />
            <span className="strip-label">Columns</span>
            {answer.columns.map((c) => <span key={c} className="strip-chip"><Columns size={13} />{c}</span>)}
            <span className="strip-sep" aria-hidden="true" />
            <span className="strip-label">Calculations</span>
            {answer.calcs.map((c) => <span key={c} className="strip-chip calc"><span className="fx" aria-hidden="true">fx</span>{c}</span>)}
            <span className="strip-tokens"><span className="strip-label">Tokens</span><b>{answer.tokens.toLocaleString('en-US')}</b></span>
          </div>
        )}

        <div className="answer-body">
          <div className="answer-main">
            <div className="answer-viz" ref={vizRef}>
              {!trace.done ? (
                <div className="thinking">
                  <div className="thinking-line">
                    <span style={{ color: 'var(--brand-ink)', display: 'flex' }}><Logo size={24} /></span>
                    <span>Akashic AI is thinking…</span>
                    <span className="thinking-status" role="status">
                      <span className="dots" aria-hidden="true"><i /><i /><i /></span>
                      {trace.status}
                    </span>
                  </div>
                  <div className="skel" />
                </div>
              ) : (
                <>
                  <AppliedFilters
                    defs={ANSWER_FILTERS}
                    value={filters}
                    onRemove={(k) => { const n = { ...filters }; delete n[k]; setFilters(n); flash('Filter removed.'); }}
                    onClear={() => { setFilters({}); flash('Filters cleared.'); }}
                  />
                  {chartNode}
                  {narr && <Narrative blocks={blocks} meta={`${rows.length} rows · ${answer.dataset}`} />}
                </>
              )}
            </div>
            <div className="viz-tools">
              {answer.dataset === 'sales_data' && (
                <FilterButton
                  defs={ANSWER_FILTERS}
                  value={filters}
                  onApply={(f) => { setFilters(f); flash(Object.keys(f).length ? 'Filters applied to the chart.' : 'Filters cleared.'); }}
                />
              )}
              <div className="viz-toolbar" role="toolbar" aria-label="Visualization type" aria-orientation="vertical">
                {KINDS.map(({ kind: k, label, Icon }) => (
                  <button key={k} type="button" aria-label={label} title={label} aria-pressed={kind === k} onClick={() => setKind(k)}>
                    <Icon size={17} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          {panel && <AgentTrace id={uid + '-trace'} steps={answer.steps} trace={trace} onClose={() => setPanel(false)} showReplay={questionStyle === 'icon'} />}
        </div>

        <div className="followups" style={latest ? undefined : { background: 'transparent' }}>
          {latest && trace.done && (
            <>
              <p className="followups-label"><Sparkle size={14} />Suggested follow-ups</p>
              <div className="followups-row">
                {answer.followups.filter((f) => f !== answer.question).map((f) => (
                  <button key={f} type="button" className="chip" onClick={() => onAsk(f, answer.dataset)}>{f}</button>
                ))}
              </div>
            </>
          )}
          <div className="feedback">
            <span role="status">{vote ? 'Thanks for the feedback.' : 'Was this answer helpful?'}</span>
            <button type="button" className="fb-btn up" aria-label="Helpful" aria-pressed={vote === 'up'} onClick={() => setVote(vote === 'up' ? null : 'up')}><ThumbUp size={15} /></button>
            <button type="button" className="fb-btn down" aria-label="Not helpful" aria-pressed={vote === 'down'} onClick={() => setVote(vote === 'down' ? null : 'down')}><ThumbDown size={15} /></button>
            {vote === 'down' && <button type="button" className="link-btn" onClick={() => flash('Feedback form opened.')}>Tell us what went wrong</button>}
          </div>
        </div>
      </article>
    </section>
  );
}

function ActionsMenu({ label, title, items, refresh }: {
  label: string;
  title: string;
  items: { group: string; title: string; sub: string; tag: string; run: () => void }[];
  refresh?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));
  let last = '';
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {label ? (
        <button type="button" className={'btn sm' + (open ? ' on' : '')} aria-haspopup="menu" aria-expanded={open} title={title} onClick={() => setOpen(!open)}>
          <Download size={14} />{label}<ChevronDown size={12} />
        </button>
      ) : (
        <button type="button" className={'btn sm' + (open ? ' on' : '')} style={{ width: 32, padding: 0 }} aria-haspopup="menu" aria-expanded={open} aria-label={title} title={title} onClick={() => setOpen(!open)}>
          <Dots size={16} />
        </button>
      )}
      {open && (
        <div className="pop menu" role="menu" aria-label={label ? 'Export answer' : 'Answer actions'} style={{ top: 'calc(100% + 8px)', right: 0, width: 312 }}>
          {refresh && (
            <>
              <button type="button" role="menuitem" className="menu-item" onClick={() => { setOpen(false); refresh(); }}>
                <Refresh size={16} style={{ marginTop: 2, color: 'var(--slate-600)' }} />
                <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span className="mi-title" style={{ fontSize: 14 }}>Refresh answer</span>
                  <span className="mi-sub">Run the question again on the latest data</span>
                </span>
              </button>
              <div className="menu-sep" />
              <div className="menu-label" style={{ color: 'var(--slate-800)' }}>Export</div>
            </>
          )}
          {items.map((it) => {
            const head = it.group !== last;
            last = it.group;
            return (
              <div key={it.tag}>
                {head && it.group !== items[0].group && <div className="menu-sep" />}
                {head && <div className="menu-label">{it.group}</div>}
                <button type="button" role="menuitem" className="menu-item" style={{ alignItems: 'center', padding: '7px 12px' }} onClick={() => { setOpen(false); it.run(); }}>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span className="mi-title" style={{ fontSize: 14 }}>{it.title}</span>
                    <span className="mi-sub">{it.sub}</span>
                  </span>
                  <span className="kbd">{it.tag}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
