import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Composer } from '../components/Composer';
import { ChevronRight, Grid, Pin } from '../components/Icons';
import { SemanticDrawer } from '../components/SemanticDrawer';
import { Shell, useCommonMenu } from '../components/Shell';
import { answerFor, datasetByName } from '../data';
import { boardSlug, useStore } from '../store';

export function Landing() {
  const { dataset, setDataset, boards, setTurns, flash } = useStore();
  const [q, setQ] = useState('');
  const [model, setModel] = useState(false);
  const nav = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const menu = useCommonMenu();
  const ds = dataset ? datasetByName(dataset) : undefined;

  const ask = (question: string) => {
    if (!dataset) return;
    const a = answerFor(question, dataset);
    setTurns([{ key: Date.now().toString(36), answerId: a.id, question, followUp: false, at: Date.now() }]);
    nav('/ask');
  };

  return (
    <Shell
      view="ask"
      menu={menu}
      right={
        <Link to="/dashboard" className="btn lg" style={{ fontWeight: 600 }} aria-label="My pinned charts">
          <Pin size={18} />
          <span className="hide-sm-label">My pinned charts</span>
        </Link>
      }
    >
      <div className="landing">
        <h1 className="hero-title">Akashic Insights (AI)</h1>
        <p className="hero-sub">Insights generation fueled by GPT</p>

        {ds && (
          <div className="suggest-row" role="list" aria-label="Suggested questions">
            {ds.questions.map((s) => (
              <button key={s} type="button" role="listitem" className="q-card" onClick={() => ask(s)}>
                <span className="q-mark" aria-hidden="true">Q.</span>
                <span>{s}</span>
              </button>
            ))}
          </div>
        )}

        <div style={{ marginTop: ds ? 46 : 48, width: '100%' }}>
          <Composer
            dataset={dataset}
            onDataset={setDataset}
            value={q}
            onChange={setQ}
            onAsk={ask}
            onModel={() => setModel(!model)}
            modelOpen={model}
            inputRef={input}
          />
        </div>
        {!ds && <p style={{ margin: '18px 0 0', fontSize: 14, color: 'var(--slate-500)', textAlign: 'center' }}>Choose data to see suggested questions.</p>}

        <section aria-labelledby="dash-heading" style={{ marginTop: ds ? 64 : 52, width: '100%' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
            <h2 id="dash-heading" style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Your dashboards</h2>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 44, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              View all dashboards
              <ChevronRight size={16} strokeWidth={2.2} />
            </Link>
          </div>
          <div className="dash-grid" role="list" aria-label="Dashboards">
            <Link to="/dashboard" role="listitem" className="dcard">
              <span className="dcard-icon" aria-hidden="true"><Pin size={22} /></span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>All Pins</span>
                <span style={{ fontSize: 14, color: 'var(--slate-500)' }}>Every chart you have pinned</span>
              </span>
            </Link>
            {boards.slice(0, 3).map((b) => (
              <Link key={b} to={'/dashboard/' + boardSlug(b)} role="listitem" className="dcard">
                <span className="dcard-icon" aria-hidden="true"><Grid size={22} /></span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 600 }}>{b}</span>
                  <span style={{ fontSize: 14, color: 'var(--slate-500)' }}>Board</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
      {model && dataset && (
        <SemanticDrawer
          dataset={dataset}
          onClose={() => setModel(false)}
          onPick={(text, label) => {
            setQ((cur) => (cur.trim() ? cur.trim() + ' ' + text : text));
            flash(`Added “${label}” to your question`);
          }}
        />
      )}
    </Shell>
  );
}
