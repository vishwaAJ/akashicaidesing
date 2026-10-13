import { useRef, useState, type CSSProperties } from 'react';
import type { FilterDefs } from '../data';
import { Close, Filter } from './Icons';
import { ChoiceChips, useDismiss } from './ui';

export type Filters = Record<string, string>;

/** Filter button + dialog. Choices are drafted and only applied on "Apply filters". */
export function FilterButton({
  defs, value, onApply, title = 'Filter chart', subtitle, size = 40, popStyle,
}: {
  defs: FilterDefs;
  value: Filters;
  onApply: (f: Filters) => void;
  title?: string;
  subtitle?: string;
  size?: number;
  popStyle?: CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Filters>(value);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));
  const n = Object.keys(value).length;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        aria-label={n ? `Filter, ${n} applied` : 'Filter'}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={'icon-btn bordered' + (open ? ' active' : n ? ' lit' : '')}
        style={{ width: size, height: size, position: 'relative' }}
        onClick={() => { setDraft(value); setOpen(!open); }}
      >
        <Filter size={size > 40 ? 20 : 17} />
        {n > 0 && !open && <span className="filter-badge" aria-hidden="true">{n}</span>}
      </button>
      {open && (
        <div className="pop filter-pop" role="dialog" aria-label={title} style={popStyle}>
          <div className="filter-head">
            <div>
              <h4>{title}</h4>
              {subtitle && <p>{subtitle}</p>}
            </div>
            <button type="button" className="icon-btn" aria-label="Close filters" style={{ width: 32, height: 32 }} onClick={() => setOpen(false)}>
              <Close size={16} />
            </button>
          </div>
          <div className="filter-body">
            {Object.entries(defs).map(([k, d]) => (
              <fieldset key={k}>
                <legend>{d.label}</legend>
                <ChoiceChips
                  options={d.options}
                  value={draft[k]}
                  onPick={(v) => {
                    const nd = { ...draft };
                    if (v) nd[k] = v;
                    else delete nd[k];
                    setDraft(nd);
                  }}
                />
              </fieldset>
            ))}
          </div>
          <div className="filter-foot">
            <button type="button" className="link-btn" style={{ fontSize: 15 }} onClick={() => setDraft({})}>Clear</button>
            <button type="button" className="btn primary lg" onClick={() => { onApply(draft); setOpen(false); }}>Apply filters</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppliedFilters({ defs, value, onRemove, onClear }: { defs: FilterDefs; value: Filters; onRemove: (k: string) => void; onClear: () => void }) {
  const keys = Object.keys(value);
  if (!keys.length) return null;
  return (
    <div className="applied" role="group" aria-label="Applied filters">
      <span>Filtered by</span>
      {keys.map((k) => (
        <span key={k} className="applied-chip">
          {defs[k]?.label ?? k}: <strong>{value[k]}</strong>
          <button type="button" aria-label={`Remove ${defs[k]?.label ?? k} filter`} onClick={() => onRemove(k)}>
            <Close size={12} />
          </button>
        </span>
      ))}
      <button type="button" className="link-btn" style={{ fontSize: 13 }} onClick={onClear}>Clear all</button>
    </div>
  );
}
