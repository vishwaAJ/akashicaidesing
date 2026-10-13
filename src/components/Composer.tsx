import { useRef, useState, type FormEvent } from 'react';
import { DATASETS, type DatasetName } from '../data';
import { ChevronDown, Database, ModelIcon, Search } from './Icons';
import { useDismiss } from './ui';

export function Composer({
  dataset, onDataset, value, onChange, onAsk, onModel, modelOpen, placeholder, inputRef,
}: {
  dataset: DatasetName | null;
  onDataset: (d: DatasetName) => void;
  value: string;
  onChange: (v: string) => void;
  onAsk: (q: string) => void;
  onModel: () => void;
  modelOpen: boolean;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const box = useRef<HTMLDivElement>(null);
  useDismiss(box, open, () => setOpen(false));
  const ready = !!dataset;
  const canAsk = ready && value.trim().length > 0;
  const list = DATASETS.filter((d) => !q || (d.name + ' ' + d.desc).toLowerCase().includes(q.toLowerCase()));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (canAsk) onAsk(value.trim());
  };

  return (
    <form aria-label="Ask a question" onSubmit={submit} style={{ width: '100%', display: 'flex', position: 'relative' }}>
      <div className="composer" ref={box}>
        <button
          type="button"
          className="cmp-seg"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Data: ${dataset ?? 'Select data'}. Change`}
          onClick={() => { setOpen(!open); setQ(''); }}
        >
          <Database size={16} style={{ color: 'var(--slate-600)', flex: 'none' }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{dataset ?? 'Select data'}</span>
          <ChevronDown size={12} strokeWidth={2.6} style={{ color: 'var(--slate-600)', flex: 'none', marginLeft: 'auto', transform: open ? 'rotate(180deg)' : undefined }} />
        </button>
        {open && (
          <div className="pop ds-pop">
            <label className="search-box">
              <Search size={18} />
              <input autoFocus placeholder="Search data sources" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search data sources" />
            </label>
            <div className="menu-label" style={{ paddingTop: 16 }}>Data sources</div>
            <div role="listbox" aria-label="Data sources" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {list.map((d) => (
                <button
                  key={d.name}
                  type="button"
                  role="option"
                  aria-selected={d.name === dataset}
                  className={'ds-option' + (d.name === dataset ? ' sel' : '')}
                  onClick={() => { onDataset(d.name); setOpen(false); setTimeout(() => inputRef?.current?.focus(), 0); }}
                >
                  <span className="ds-name">{d.name}</span>
                  <span className="ds-desc">{d.desc}</span>
                </button>
              ))}
              {!list.length && <p style={{ margin: '8px 12px', color: 'var(--slate-500)' }}>No data sources match “{q}”.</p>}
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          className="cmp-input"
          aria-label="Type your question"
          placeholder={ready ? placeholder ?? `Ask a question about ${dataset}…` : 'Choose data to start asking'}
          disabled={!ready}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="cmp-actions">
          <button
            type="button"
            className={'btn' + (modelOpen ? ' on' : '') + (ready ? '' : ' quiet')}
            disabled={!ready}
            aria-haspopup="dialog"
            aria-expanded={modelOpen}
            aria-controls="data-model-drawer"
            onClick={onModel}
          >
            <ModelIcon size={16} />
            Semantic model
          </button>
          <button type="submit" className="btn primary" disabled={!canAsk} style={{ padding: '0 20px' }}>Ask</button>
        </div>
      </div>
    </form>
  );
}
