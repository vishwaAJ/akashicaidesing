import { Fragment, useState } from 'react';
import type { NarrativeBlock } from '../data';
import { useStore } from '../store';
import { Arrow, Copy, SparkleFill, ThumbDown, ThumbUp } from './Icons';

/** Renders "[[3.92M]]" markers as blue value chips. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/\[\[(.+?)\]\]/g);
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <span key={i} className="nv">{p}</span> : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}

export const plain = (blocks: NarrativeBlock[]) =>
  blocks
    .map((b) =>
      b.kind === 'p' ? b.text : b.kind === 'bullets' ? b.items.map((i) => '• ' + i).join('\n') : b.items.map((k) => `${k.label}: ${k.value} (${k.note})`).join('\n'),
    )
    .join('\n\n')
    .replace(/\[\[|\]\]/g, '');

export function Narrative({ blocks, meta }: { blocks: NarrativeBlock[]; meta: string }) {
  const { flash } = useStore();
  const [vote, setVote] = useState<'up' | 'down' | null>(null);
  const copy = () => {
    try {
      void navigator.clipboard?.writeText(plain(blocks)).catch(() => undefined);
    } catch {
      /* clipboard unavailable */
    }
    flash('Insights copied to clipboard.');
  };
  return (
    <section className="narr" aria-label="AI insights">
      <div className="narr-head">
        <div className="narr-title">
          <span className="narr-badge" aria-hidden="true"><SparkleFill size={15} /></span>
          <span className="narr-name">AI insights</span>
          <span className="narr-meta">{meta}</span>
        </div>
        <div className="narr-acts">
          <button type="button" aria-label="Copy insights" title="Copy insights" onClick={copy}><Copy size={15} /></button>
          <button type="button" aria-label="Good insights" title="Good insights" aria-pressed={vote === 'up'} onClick={() => { setVote(vote === 'up' ? null : 'up'); if (vote !== 'up') flash('Thanks for the feedback.'); }}><ThumbUp size={15} /></button>
          <button type="button" aria-label="Poor insights" title="Poor insights" aria-pressed={vote === 'down'} onClick={() => { setVote(vote === 'down' ? null : 'down'); if (vote !== 'down') flash('Thanks, we’ll use this to improve insights.'); }}><ThumbDown size={15} /></button>
        </div>
      </div>
      <div className="narr-body">
        {blocks.map((b, i) => {
          if (b.kind === 'p') return <p key={i}><Rich text={b.text} /></p>;
          if (b.kind === 'bullets')
            return (
              <ul key={i}>
                {b.items.map((it) => (
                  <li key={it}>
                    <span className="narr-arrow" aria-hidden="true"><Arrow size={11} /></span>
                    <span><Rich text={it} /></span>
                  </li>
                ))}
              </ul>
            );
          return (
            <div key={i} className="kpis">
              {b.items.map((k) => (
                <div key={k.label} className="kpi">
                  <div className="kpi-label">{k.label}</div>
                  <div className="kpi-value">
                    {k.value}
                    {k.delta && <span className="kpi-delta">▲ {k.delta}</span>}
                  </div>
                  <div className="kpi-note">{k.note}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
