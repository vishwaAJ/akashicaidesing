/** 3,919,615.66 → "3.92M", 975,003 → "975K", 58.9 → "58.9" */
export function compact(n: number, digits?: number): string {
  const a = Math.abs(n);
  if (a >= 1e9) return trim(n / 1e9, digits ?? 2) + 'B';
  if (a >= 1e6) return trim(n / 1e6, digits ?? 2) + 'M';
  if (a >= 1e3) {
    const k = n / 1e3;
    return trim(k, digits ?? (Math.abs(k) >= 100 ? 0 : 1)) + 'K';
  }
  return trim(n, digits ?? (Number.isInteger(n) ? 0 : 1));
}

function trim(n: number, d: number) {
  return n.toFixed(d);
}

/** Axis ticks: drops trailing zeros, so 1.50M → "1.5M", 4.00M → "4M". */
export function tick(n: number): string {
  if (n === 0) return '0';
  const a = Math.abs(n);
  const [v, s] = a >= 1e9 ? [n / 1e9, 'B'] : a >= 1e6 ? [n / 1e6, 'M'] : a >= 1e3 ? [n / 1e3, 'K'] : [n, ''];
  return String(Number(v.toFixed(2))) + s;
}

export function full(n: number, digits = 2): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function pct(part: number, total: number, digits = 1): string {
  return ((part / total) * 100).toFixed(digits) + '%';
}

/** A "nice" axis maximum and step for a value range starting at zero. */
export function niceScale(max: number, target = 4): { max: number; step: number } {
  if (max <= 0) return { max: 1, step: 1 };
  const raw = max / target;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  return { max: Math.ceil(max / step) * step, step };
}
