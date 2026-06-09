// MM-040 — Portfolio-event notification template.
// Sent when daily P&L exceeds ±5% for a user's portfolio.

export interface PortfolioEventPayload {
  dailyPnlPct: number;
}

export function portfolioEventTemplate(p: PortfolioEventPayload): {
  title: string;
  body: string;
  data: Record<string, string>;
} {
  const pct = Math.abs(p.dailyPnlPct).toFixed(1);
  const direction = p.dailyPnlPct >= 0 ? 'up' : 'down';
  return {
    title: `Your portfolio is ${direction} ${pct}% today`,
    body: `Your virtual portfolio moved ${pct}% today. Check your holdings for details. Educational simulation — not investment advice.`,
    data: { type: 'portfolio_event', route: '/(tabs)/portfolio' },
  };
}
