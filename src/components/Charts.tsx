import { useEffect, useMemo, useRef, useState } from 'react';
import type { Row } from '../data';
import { compact, full, niceScale, pct, tick } from '../format';

export interface ValueFormat { digits?: number; unit?: string }

/** Small values with an explicit precision (units, years, %) are shown in full; money is compacted. */
export function fmtValue(v: number, f: ValueFormat = {}): string {
  if ((f.digits !== undefined || f.unit) && Math.abs(v) < 10000) {
    return v.toLocaleString('en-US', { maximumFractionDigits: f.digits ?? 1, minimumFractionDigits: f.digits ?? 0 }) + (f.unit ?? '');
  }
  return compact(v);
}

type Size = 'answer' | 'board' | 'mini';

const GEOM: Record<Size, { w: number; h: number; l: number; r: number; t: number; b: number; font: number; axis: boolean }> = {
  answer: { w: 1000, h: 380, l: 70, r: 980, t: 30, b: 310, font: 13, axis: true },
  board: { w: 640, h: 334, l: 60, r: 630, t: 50, b: 270, font: 12, axis: true },
  mini: { w: 400, h: 220, l: 20, r: 395, t: 30, b: 190, font: 11, axis: false },
};

export function CartesianChart({
  rows, kind, size = 'answer', yLabel, xLabel, color = '#2563EB', format, labels, ariaLabel,
}: {
  rows: Row[];
  kind: 'line' | 'area' | 'column';
  size?: Size;
  yLabel?: string;
  xLabel?: string;
  color?: string;
  format?: ValueFormat;
  labels?: string[];
  ariaLabel?: string;
}) {
  const g = GEOM[size];
  const { max, step } = niceScale(Math.max(...rows.map((r) => r.value), 0), size === 'mini' ? 2 : size === 'answer' ? 5 : 3);
  const ticks: number[] = [];
  for (let v = 0; v <= max + step / 2; v += step) ticks.push(v);
  const y = (v: number) => g.b - (v / max) * (g.b - g.t);
  const n = rows.length;
  const band = (g.r - g.l) / Math.max(n, 1);
  const cx = (i: number) => g.l + band * (i + 0.5);
  const barW = Math.min(band * (size === 'mini' ? 0.62 : 0.62), size === 'answer' ? 120 : 70);
  const many = n > 8;
  const pts = rows.map((r, i) => [cx(i), y(r.value)] as const);
  const line = pts.map((p) => p.join(',')).join(' ');
  const tickFont = many && size !== 'answer' ? g.font - 1 : g.font;

  return (
    <svg viewBox={`0 0 ${g.w} ${g.h}`} width="100%" role="img" aria-label={ariaLabel} style={{ display: 'block', overflow: 'visible' }}>
      {g.axis && yLabel && (
        <text x={g.l} y={size === 'board' ? g.t - 30 : g.t - 16} fontSize={g.font} fill="#64748B">{yLabel}</text>
      )}
      <g stroke="#E2E8F0" strokeDasharray="4 4">
        {ticks.slice(1).map((t) => <line key={t} x1={g.l} x2={g.r} y1={y(t)} y2={y(t)} />)}
      </g>
      <line x1={g.l} x2={g.r} y1={g.b} y2={g.b} stroke="#94A3B8" />
      {g.axis && (
        <g fontSize={g.font} fill="#64748B" textAnchor="end">
          {ticks.map((t) => <text key={t} x={g.l - 10} y={y(t) + 4}>{tick(t)}</text>)}
        </g>
      )}
      {kind === 'column' && (
        <g fill={color}>
          {rows.map((r, i) => (
            <rect key={r.label} x={cx(i) - barW / 2} y={y(r.value)} width={barW} height={Math.max(0, g.b - y(r.value))} rx={size === 'mini' ? 2 : 3}>
              <title>{`${r.label}: ${fmtValue(r.value, format)}`}</title>
            </rect>
          ))}
        </g>
      )}
      {kind === 'area' && (
        <polygon points={`${g.l + band / 2},${g.b} ${line} ${cx(n - 1)},${g.b}`} fill={color} fillOpacity={size === 'mini' ? 0.12 : 0.14} />
      )}
      {(kind === 'line' || kind === 'area') && (
        <>
          <polyline points={line} fill="none" stroke={color} strokeWidth={size === 'mini' ? 2 : 2.5} strokeLinejoin="round" />
          {size !== 'mini' &&
            pts.map(([px, py], i) => (
              <circle key={i} cx={px} cy={py} r={5} fill="#FFFFFF" stroke={color} strokeWidth={2}>
                <title>{`${rows[i].label}: ${fmtValue(rows[i].value, format)}`}</title>
              </circle>
            ))}
        </>
      )}
      <g fontSize={size === 'answer' ? 11.5 : g.font - 0.5} fontWeight={700} fill="#1E293B" textAnchor="middle">
        {rows.map((r, i) => {
          if (size === 'mini' && kind !== 'column') {
            const isPeak = rows.every((o, j) => j === i || Math.abs(j - i) > 2 || o.value <= r.value);
            if (!isPeak) return null;
          }
          if (size === 'mini' && kind === 'column' && i > 1 && n > 4) return null;
          // Line and area labels sit up and to the right of the point, clear of the line.
          const off = kind === 'column' ? 0 : size === 'mini' ? 0 : 22;
          return <text key={r.label} x={cx(i) + off} y={y(r.value) - (kind === 'column' ? 8 : 12)}>{fmtValue(r.value, format)}</text>;
        })}
      </g>
      <g fontSize={tickFont} fill={size === 'mini' ? '#64748B' : '#334155'} textAnchor="middle">
        {rows.map((r, i) => {
          const lbl = labels?.[i] ?? r.label;
          if (size === 'mini' && kind !== 'column' && n > 6 && i % 2 === 1) return null;
          const ty = g.b + (size === 'mini' ? 18 : 22);
          // Long category names wrap onto two lines when they would collide with a neighbour.
          const words = lbl.split(' ');
          if (lbl.length * tickFont * 0.56 > band * 0.96 && words.length > 1) {
            const half = Math.ceil(words.length / 2);
            return (
              <text key={r.label} x={cx(i)} y={ty}>
                <tspan x={cx(i)}>{words.slice(0, half).join(' ')}</tspan>
                <tspan x={cx(i)} dy={tickFont + 2}>{words.slice(half).join(' ')}</tspan>
              </text>
            );
          }
          return <text key={r.label} x={cx(i)} y={ty}>{lbl}</text>;
        })}
      </g>
      {g.axis && xLabel && (
        <text x={(g.l + g.r) / 2} y={g.h - 6} fontSize={g.font - 1} fill="#64748B" textAnchor="middle">{xLabel}</text>
      )}
    </svg>
  );
}

export function HBars({ rows, format, compactLayout }: { rows: Row[]; format?: ValueFormat; compactLayout?: boolean }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="hbars" role="img" aria-label="Bar chart" style={compactLayout ? { gap: 12 } : undefined}>
      {rows.map((r) => (
        <div key={r.label} className="hbar" style={compactLayout ? { gridTemplateColumns: '84px 1fr 52px', fontSize: 13 } : undefined}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</span>
          <span className="hbar-track" style={compactLayout ? { height: 22 } : undefined}>
            <span className="hbar-fill" style={{ display: 'block', width: `${(r.value / max) * 100}%`, background: compactLayout ? '#3B82F6' : undefined }} />
          </span>
          <span className="hbar-val">{fmtValue(r.value, format)}</span>
        </div>
      ))}
    </div>
  );
}

export function DataTable({ rows, dim, measure, format }: { rows: Row[]; dim: string; measure: string; format?: ValueFormat }) {
  const total = rows.reduce((a, r) => a + r.value, 0);
  const money = format?.digits === undefined && !format?.unit;
  return (
    <div className="dtable-wrap">
      <table className="dtable">
        <thead>
          <tr><th scope="col">{dim}</th><th scope="col" className="num">{measure}</th><th scope="col" className="num">Share</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td>{r.label}</td>
              <td className="num">{money ? full(r.value) : fmtValue(r.value, format)}</td>
              <td className="num">{pct(r.value, total, 2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p = (a: number) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1}`;
}

export function Donut({
  rows, colors, size = 168, thickness = 34, centerTitle = 'Total', centerValue,
}: { rows: Row[]; colors: string[]; size?: number; thickness?: number; centerTitle?: string; centerValue?: string }) {
  const total = rows.reduce((a, r) => a + r.value, 0);
  const r = (size - thickness) / 2;
  let a = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Donut chart" style={{ flex: 'none' }}>
      {rows.map((row, i) => {
        const a0 = a;
        a += (row.value / total) * Math.PI * 2;
        return (
          <path key={row.label} d={arc(size / 2, size / 2, r, a0, a - 0.0001)} fill="none" stroke={colors[i % colors.length]} strokeWidth={thickness}>
            <title>{`${row.label}: ${compact(row.value)} · ${pct(row.value, total)}`}</title>
          </path>
        );
      })}
      <text x={size / 2} y={size / 2 - 6} textAnchor="middle" fontSize={size > 200 ? 13 : 11.5} fill="#64748B">{centerTitle}</text>
      <text x={size / 2} y={size / 2 + (size > 200 ? 18 : 14)} textAnchor="middle" fontSize={size > 200 ? 21 : 17} fontWeight={700} fill="#0F172A">
        {centerValue ?? compact(total)}
      </text>
    </svg>
  );
}

interface Tile { row: Row; x: number; y: number; w: number; h: number }

/** Squarified treemap layout in a unit box (0..100 × 0..100). */
function squarify(rows: Row[], W: number, H: number): Tile[] {
  const total = rows.reduce((a, r) => a + r.value, 0);
  const items = rows.map((r) => ({ row: r, area: (r.value / total) * W * H }));
  const out: Tile[] = [];
  let x = 0, y = 0, w = W, h = H;
  let i = 0;
  const worst = (row: number[], side: number) => {
    const s = row.reduce((a, b) => a + b, 0);
    const mx = Math.max(...row), mn = Math.min(...row);
    return Math.max((side * side * mx) / (s * s), (s * s) / (side * side * mn));
  };
  while (i < items.length) {
    const side = Math.min(w, h);
    const row: typeof items = [items[i]];
    let j = i + 1;
    while (j < items.length && worst([...row, items[j]].map((t) => t.area), side) <= worst(row.map((t) => t.area), side)) {
      row.push(items[j]);
      j++;
    }
    const s = row.reduce((a, t) => a + t.area, 0);
    if (w >= h) {
      const cw = s / h;
      let cy = y;
      row.forEach((t) => { const th = t.area / cw; out.push({ row: t.row, x, y: cy, w: cw, h: th }); cy += th; });
      x += cw; w -= cw;
    } else {
      const ch = s / w;
      let cx = x;
      row.forEach((t) => { const tw = t.area / ch; out.push({ row: t.row, x: cx, y, w: tw, h: ch }); cx += tw; });
      y += ch; h -= ch;
    }
    i = j;
  }
  return out;
}

export function Treemap({
  rows, colors, light, height = 206, showLabels = true, aspect = 1.9,
}: { rows: Row[]; colors: Record<string, string>; light: Set<string>; height?: number; showLabels?: boolean; aspect?: number }) {
  const tiles = useMemo(() => squarify(rows, 100 * aspect, 100), [rows, aspect]);
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} role="img" aria-label="Treemap" style={{ position: 'relative', height, width: '100%' }}>
      {tiles.map((t) => {
        const big = (t.w / aspect) * t.h > 1500;
        const pxW = (t.w / (100 * aspect)) * width;
        const pxH = (t.h / 100) * height;
        const fits = pxW >= t.row.label.length * (big ? 7.8 : 6.6) + 4 && pxH >= 20;
        return (
          <div
            key={t.row.label}
            title={`${t.row.label}: ${compact(t.row.value)}`}
            style={{
              position: 'absolute', left: `${(t.x / (100 * aspect)) * 100}%`, top: `${t.y}%`, width: `${(t.w / (100 * aspect)) * 100}%`, height: `${t.h}%`,
              background: colors[t.row.label] ?? '#94A3B8', border: '1px solid #FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: light.has(t.row.label) ? '#1E293B' : '#FFFFFF', fontSize: big ? 14 : 12, fontWeight: 600, overflow: 'hidden', textAlign: 'center',
            }}
          >
            {showLabels && fits ? t.row.label : ''}
          </div>
        );
      })}
    </div>
  );
}
