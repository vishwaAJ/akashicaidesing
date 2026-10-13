import { Fragment, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chat, ChevronDown, DatabaseStack, Search, TableIcon } from '../components/Icons';
import { Shell, useCommonMenu } from '../components/Shell';
import { CheckMark, useDismiss } from '../components/ui';
import { MODELS, modelByName, type ColType, type Model } from '../data';
import { useStore } from '../store';

const TYPE: Record<ColType, string> = { text: 'Text', num: 'Number', date: 'Date', id: 'Identifier' };

const nCols = (m: Model) => m.groups.reduce((a, g) => a + g[1].length, 0);
const meta = (m: Model) => `1 table · ${nCols(m)} columns · ${m.metrics.length} metrics`;

export function DataModel() {
  const { dataset, setDataset, setTurns } = useStore();
  const [name, setName] = useState<string>(dataset ?? 'sales_data');
  const [picker, setPicker] = useState(false);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'tables' | 'metrics' | 'glossary'>('tables');
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, picker, () => setPicker(false));
  const nav = useNavigate();
  const common = useCommonMenu();

  const cur = modelByName(name);
  const needle = q.trim().toLowerCase();
  const hit = (...xs: string[]) => !needle || xs.some((x) => x.toLowerCase().includes(needle));
  const groups = cur.groups.map(([g, cols]) => [g, cols.filter((c) => hit(c[0], c[1], c[3]))] as const).filter(([, c]) => c.length);
  const metrics = cur.metrics.filter((m) => hit(...m));
  const glossary = cur.glossary.filter((g) => hit(...g));
  const colCount = groups.reduce((a, [, c]) => a + c.length, 0);
  const empty = (tab === 'tables' && !colCount) || (tab === 'metrics' && !metrics.length) || (tab === 'glossary' && !glossary.length);

  const tabs: [typeof tab, string, number][] = [['tables', 'Tables', colCount], ['metrics', 'Metrics', metrics.length], ['glossary', 'Glossary', glossary.length]];

  return (
    <Shell crumb="Data model" view="model" menu={common}>
      <div className="dmp">
        <h1>Data model</h1>
        <div className="dmp-row" ref={ref}>
          <button
            type="button"
            className="select-btn"
            aria-haspopup="listbox"
            aria-expanded={picker}
            onClick={() => setPicker(!picker)}
            style={picker ? { borderColor: 'var(--blue-600)', boxShadow: '0 0 0 3px rgba(37,99,235,0.15)' } : undefined}
          >
            <DatabaseStack size={18} style={{ color: 'var(--blue-600)' }} />
            <span style={{ color: 'var(--slate-600)' }}>Model</span>
            <b>{cur.name}</b>
            <ChevronDown size={16} style={{ transform: picker ? 'rotate(180deg)' : undefined, transition: 'transform .15s' }} />
          </button>
          <span className="dmp-meta">{cur.desc} · {meta(cur)}</span>
          {picker && (
            <div className="pop model-pop" role="listbox" aria-label="Models">
              {MODELS.map((m) => (
                <button key={m.name} type="button" role="option" aria-selected={m.name === cur.name} className={'model-opt' + (m.name === cur.name ? ' sel' : '')}
                  onClick={() => { setName(m.name); setPicker(false); }}>
                  <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 600 }}>
                    {m.name}
                    {m.name === cur.name && <CheckMark />}
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--slate-600)' }}>{m.desc}</span>
                  <span style={{ fontSize: 12.5, color: 'var(--slate-500)' }}>{meta(m)} · {m.rows}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="dmp-row">
          <label className="search-box" style={{ width: 280, height: 44, background: 'var(--white)' }}>
            <Search size={18} />
            <input placeholder="Search columns, metrics, terms" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search columns, metrics, terms" />
          </label>
          <button
            type="button"
            className="btn primary lg"
            onClick={() => { setDataset(cur.name); setTurns([]); nav('/'); }}
          >
            <Chat size={18} />
            Ask about this data
          </button>
        </div>

        <div className="panel">
          <div className="panel-tabs" role="tablist">
            {tabs.map(([k, label, n]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} className={'tab-btn' + (tab === k ? ' active' : '')} onClick={() => setTab(k)}>
                {label} <span className="count">{n}</span>
              </button>
            ))}
          </div>

          {tab === 'tables' && colCount > 0 && (
            <>
              <div className="tbl-head">
                <span className="tbl-icon"><TableIcon size={18} /></span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{cur.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--slate-600)' }}>{cur.tableMeta}</div>
                </div>
              </div>
              <table className="cols">
                <thead>
                  <tr><th style={{ width: '34%' }}>Column</th><th style={{ width: '16%' }}>Type</th><th className="hide-sm">Example values</th></tr>
                </thead>
                <tbody>
                  {groups.map(([g, cols]) => (
                    <Fragment key={g}>
                      <tr className="grp"><td colSpan={3}>{g}</td></tr>
                      {cols.map(([label, key, type, samples]) => (
                        <tr key={key}>
                          <td><div className="col-name">{label}</div><div className="col-key">{key}</div></td>
                          <td><span className={'pill ' + type}>{TYPE[type]}</span></td>
                          <td className="hide-sm" style={{ paddingTop: 12 }}>{samples}</td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {tab === 'metrics' && metrics.length > 0 && (
            <div className="cards3">
              {metrics.map(([n, formula, desc]) => (
                <div key={n} className="gcard">
                  <div className="term"><span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: 'var(--blue-700)', marginRight: 8 }}>fx</span>{n}</div>
                  <code className="formula">{formula}</code>
                  <div className="note" style={{ marginTop: 8, fontSize: 14, color: 'var(--slate-600)' }}>{desc}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'glossary' && glossary.length > 0 && (
            <div className="cards3">
              {glossary.map(([term, means, note]) => (
                <div key={term} className="gcard">
                  <div className="term">“{term}”</div>
                  <div className="means">means <b>{means}</b></div>
                  {note && <div className="note">{note}</div>}
                </div>
              ))}
            </div>
          )}

          {empty && <p style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--slate-500)' }}>Nothing in {cur.name} matches “{q}”.</p>}
        </div>
      </div>
    </Shell>
  );
}
