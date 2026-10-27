const eur = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
const eur0 = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 1 });

export function formatEUR(
  value: number | null | undefined,
  opts: { decimals?: boolean; sign?: boolean } = {},
) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  const { decimals = true, sign = false } = opts;
  const str = (decimals ? eur : eur0).format(value);
  return sign && value > 0 ? `+${str}` : str;
}

export function formatPct(value: number | null | undefined, opts: { sign?: boolean } = {}) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  const str = `${num.format(Math.round(value))}%`;
  return opts.sign && value > 0 ? `+${str}` : str;
}

export function formatNumber(value: number) {
  return num.format(value);
}

export function formatDate(
  value: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' },
) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('it-IT', opts);
}

export function formatDays(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  const v = Math.round(value);
  return v === 1 ? '1 giorno' : `${v} giorni`;
}
