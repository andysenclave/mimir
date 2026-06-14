// Indian comma formatting: ₹1,23,456.78 (lakh-crore grouping).
// CLAUDE.md §14 mobile rule — every numeric value uses mono font + Indian comma formatting.

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatINR(amount: number | string): string {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(value)) return '—';
  return INR_FORMATTER.format(value);
}

// Compact form for space-constrained UI (e.g. tab badges, small cards).
const INR_COMPACT_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatINRCompact(amount: number | string): string {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  if (!Number.isFinite(value)) return '—';
  return INR_COMPACT_FORMATTER.format(value);
}
