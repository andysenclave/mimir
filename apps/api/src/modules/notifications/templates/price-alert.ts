// MM-040 — Price-alert notification template.
// Brand voice: knowing friend, no emoji, no sensationalism, Indian phrasing.
// SEBI: no buy/sell recommendation, no prediction. (CLAUDE.md §10, REFERENCE.md §3.7)

export interface PriceAlertPayload {
  symbol: string;
  direction: 'up' | 'down';
  changePct: number;
}

export function priceAlertTemplate(p: PriceAlertPayload): {
  title: string;
  body: string;
  data: Record<string, string>;
} {
  const moved = p.direction === 'up' ? 'risen' : 'fallen';
  const pct = Math.abs(p.changePct).toFixed(1);
  return {
    title: `${p.symbol} has ${moved} ${pct}% today`,
    body: `${p.symbol} moved ${pct}% from yesterday's close. Educational simulation — not investment advice.`,
    data: { type: 'price_alert', symbol: p.symbol, route: '/market' },
  };
}
