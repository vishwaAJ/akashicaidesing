import { useMemo, useRef, useState } from 'react';
import { DRAWER_SALES, modelByName, type DatasetName, type DrawerType } from '../data';
import { ChevronDown, Close, Plus, Search } from './Icons';
import { useDismiss } from './ui';

const TYPES: Record<DrawerType, [string, string]> = { cat: ['Categorical', 'cat'], num: ['Numerical', 'num'], date: ['Date', 'date'] };

/** The sales_data drawer uses curated names; other datasets are derived from the model explorer. */
function drawerData(dataset: DatasetName) {
  if (dataset === 'sales_data') return DRAWER_SALES;
  const m = modelByName(dataset);
  return {
    groups: m.groups.map(([g, cols]) => [g, cols.map(([label, , type, samples]) => [label, (type === 'num' ? 'num' : type === 'date' ? 'date' : 'cat') as DrawerType, samples])]) as typeof DRAWER_SALES.groups,
    calcs: m.metrics.map(([name, , desc]) => [name, desc]) as [string, string][],
  };
}

export function SemanticDrawer({ dataset, onClose, onPick }: { dataset: DatasetName; onClose: () => void; onPick: (text: string, label: string) => void }) {
  const [tab, setTab] = useState<'fields' | 'measures'>('fields');
  const [q, setQ] = useState('');
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, true, onClose);
  const data = useMemo(() => drawerData(dataset), [dataset]);
  const desc = modelByName(dataset).desc;
  const needle = q.trim().toLowerCase();
  const hit = (...xs: string[]) => !needle || xs.some((x) => x.toLowerCase().includes(needle));

  const groups = data.groups
    .map(([name, cols]) => ({ name, cols: cols.filter(([l, t, s]) => hit(l, TYPES[t][0], s)) }))
    .filter((g) => g.cols.length);
  const nCols = groups.reduce((a, g) => a + g.cols.length, 0);
  const calcs = data.calcs.filter(([n, d]) => hit(n, d));

  return (
    <>
      <div className="drawer-scrim" aria-hidden="true" />
      <div ref={ref} className="drawer" role="dialog" aria-label="Semantic model" id="data-model-drawer">
        <div className="dm">
          <div className="dm-top">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 8px 0 16px' }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{dataset}</h2>
              <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}><Close /></button>
            </div>
            <p style={{ margin: '2px 16px 10px', fontSize: 13, lineHeight: 1.45, color: 'var(--slate-500)' }}>{dataset === 'sales_data' ? 'Orders for model cars, bikes, planes, ships and trains' : desc}</p>
            <label className="search-box" style={{ margin: '0 16px 8px', height: 40 }}>
              <Search size={18} />
              <input placeholder="Search columns and calculations" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search columns and calculations" />
            </label>
            <div role="tablist" style={{ display: 'flex', gap: 8, padding: '0 10px' }}>
              <button role="tab" aria-selected={tab === 'fields'} className={'tab-btn' + (tab === 'fields' ? ' active' : '')} style={{ minHeight: 42, padding: '0 8px' }} onClick={() => setTab('fields')}>
                Columns <span className="count">{nCols}</span>
              </button>
              <button role="tab" aria-selected={tab === 'measures'} className={'tab-btn' + (tab === 'measures' ? ' active' : '')} style={{ minHeight: 42, padding: '0 8px' }} onClick={() => setTab('measures')}>
                Calculations <span className="count">{calcs.length}</span>
              </button>
            </div>
          </div>
          <div className="dm-scroll">
            {tab === 'fields' &&
              groups.map((g) => {
                const open = needle ? true : !closed[g.name];
                return (
                  <section key={g.name} aria-label={g.name}>
                    <button type="button" className="dm-group-head" aria-expanded={open} onClick={() => setClosed({ ...closed, [g.name]: open })}>
                      <span style={{ color: 'var(--slate-700)', fontWeight: 700 }}>{g.name} <span>· {g.cols.length}</span></span>
                      <ChevronDown size={16} style={{ transform: `rotate(${open ? 180 : 0}deg)`, transition: 'transform .15s' }} />
                    </button>
                    {open &&
                      g.cols.map(([label, type, samples]) => (
                        <div key={label} className="dm-card">
                          <div style={{ minWidth: 0 }}>
                            <div className="dm-name">{label}<span className={'pill ' + TYPES[type][1]}>{TYPES[type][0]}</span></div>
                            <div className="dm-samples">{samples}</div>
                          </div>
                          <button type="button" className="add-btn" aria-label={`Add ${label} to question`} title={`Add ${label} to question`} onClick={() => onPick(label.toLowerCase(), label)}>
                            <Plus />
                          </button>
                        </div>
                      ))}
                  </section>
                );
              })}
            {tab === 'measures' && (
              <div style={{ paddingTop: 14 }}>
                {calcs.map(([name, d]) => (
                  <div key={name} className="dm-card">
                    <div style={{ minWidth: 0 }}>
                      <div className="dm-name"><span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: 'var(--blue-700)' }}>fx</span>{name}</div>
                      <div className="dm-samples">{d}</div>
                    </div>
                    <button type="button" className="add-btn" aria-label={`Add ${name} to question`} title={`Add ${name} to question`} onClick={() => onPick(name.toLowerCase(), name)}>
                      <Plus />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {((tab === 'fields' && !groups.length) || (tab === 'measures' && !calcs.length)) && (
              <p style={{ padding: '24px 4px', color: 'var(--slate-500)', textAlign: 'center' }}>Nothing matches “{q}”.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
