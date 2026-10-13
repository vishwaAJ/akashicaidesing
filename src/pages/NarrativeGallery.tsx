import { Narrative } from '../components/Narrative';
import { Shell, useCommonMenu } from '../components/Shell';
import type { NarrativeBlock } from '../data';

const SHAPES: { title: string; sub: string; meta: string; blocks: NarrativeBlock[] }[] = [
  {
    title: 'Bullets only', sub: 'Several parallel points', meta: '7 rows · sales_data',
    blocks: [{ kind: 'bullets', items: [
      'Classic Cars lead with [[3.92M]], about [[39%]] of all sales.',
      'Vintage Cars are second at [[1.90M]], roughly half of Classic Cars.',
      'Motorcycles ([[1.17M]]) and Trucks and Buses ([[1.13M]]) perform almost the same.',
      'Trains are the smallest product line at [[226K]], about [[2%]] of the total.',
    ] }],
  },
  {
    title: 'Paragraph only', sub: 'An explanation or a single finding', meta: '3 rows · sales_data',
    blocks: [{ kind: 'p', text: 'Total sales rose from [[3.52M]] in 2003 to a peak of [[4.72M]] in 2004, an increase of about [[34%]]. The [[1.79M]] shown for 2005 is not a full year: the data only runs from January to May 2005, so it shouldn’t be compared directly with the earlier years.' }],
  },
  {
    title: 'KPIs only', sub: 'Headline numbers, with change where it applies', meta: '2,823 rows · sales_data',
    blocks: [{ kind: 'kpis', items: [
      { label: 'Total Sales', value: '10.03M', note: 'Jan 2003 – May 2005' },
      { label: 'Best year', value: '4.72M', delta: '34%', note: '2004 vs 2003' },
      { label: 'Average Order Value', value: '32.7K', note: '10.03M across 307 orders' },
      { label: 'Cancelled order lines', value: '60', note: 'Out of 2,823 lines' },
    ] }],
  },
  {
    title: 'Mixed', sub: 'KPIs first, then text', meta: '3 rows · sales_data',
    blocks: [
      { kind: 'kpis', items: [
        { label: 'Total Sales 2004', value: '4.72M', delta: '34%', note: 'vs 2003' },
        { label: 'Total Sales 2005', value: '1.79M', note: 'Jan–May only' },
      ] },
      { kind: 'p', text: 'Classic Cars and Vintage Cars together make up [[58%]] of all sales.' },
      { kind: 'bullets', items: ['2005 only covers five months, so compare it month by month rather than as a full year.'] },
    ],
  },
];

export function NarrativeGallery() {
  return (
    <Shell crumb="Narrative container" view={null} menu={useCommonMenu()}>
      <div className="dmp" style={{ maxWidth: 960 }}>
        <div>
          <h1 style={{ fontSize: 24 }}>Narrative container</h1>
          <p style={{ margin: '6px 0 0', maxWidth: 660, fontSize: 15, color: 'var(--slate-600)' }}>
            One container for every answer. The header strip and spacing never change; the body takes whatever shape the narrative has.
            Data values use the blue value style instead of bold.
          </p>
        </div>
        {SHAPES.map((s) => (
          <section key={s.title} aria-label={s.title}>
            <h2 style={{ margin: '6px 0 10px', fontSize: 16, display: 'flex', alignItems: 'baseline', gap: 10 }}>
              {s.title} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--slate-500)' }}>{s.sub}</span>
            </h2>
            <div className="panel" style={{ padding: 18 }}>
              <Narrative blocks={s.blocks} meta={s.meta} />
            </div>
          </section>
        ))}
      </div>
    </Shell>
  );
}
