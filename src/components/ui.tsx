import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { useStore } from '../store';
import { Check, Close } from './Icons';

/** Calls `onAway` on a pointer-down outside `ref` or on Escape while `active`. */
export function useDismiss(ref: RefObject<HTMLElement>, active: boolean, onAway: () => void) {
  const cb = useRef(onAway);
  cb.current = onAway;
  useEffect(() => {
    if (!active) return;
    const down = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb.current();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cb.current();
    };
    document.addEventListener('pointerdown', down);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('pointerdown', down);
      document.removeEventListener('keydown', key);
    };
  }, [ref, active]);
}

export function Switch({ label, checked, onChange, controls }: { label: string; checked: boolean; onChange: () => void; controls?: string }) {
  return (
    <span className="switch-wrap">
      {label}
      <button type="button" role="switch" aria-checked={checked} aria-label={label} aria-controls={controls} className="switch" onClick={onChange} />
    </span>
  );
}

export function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return (
    <div className="toast" role="status">
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#10B981" />
        <path d="M7.5 12.5l3 3 6-6" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {toast}
    </div>
  );
}

export function Modal({ title, onClose, children, footer, wide }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, true, onClose);
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('input, button:not([aria-label="Close"])')?.focus();
  }, []);
  return (
    <div className="modal-scrim">
      <div ref={ref} className={'modal' + (wide ? ' modal-max' : '')} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}><Close /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

/** Choice chips used by every filter dialog. */
export function ChoiceChips({ options, value, onPick }: { options: string[]; value?: string; onPick: (v: string | undefined) => void }) {
  return (
    <div className="filter-opts">
      {options.map((o) => (
        <button key={o} type="button" className="chip-opt" aria-pressed={value === o} onClick={() => onPick(value === o ? undefined : o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

export function CheckMark() {
  return <Check size={16} style={{ color: 'var(--blue-600)' }} />;
}
