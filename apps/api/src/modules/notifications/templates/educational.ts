// MM-057 — Educational-trigger notification template.
// Brand voice: knowing friend, no emoji, no sensationalism, Indian phrasing.
// SEBI / CLAUDE.md §10: templated copy only (never LLM-generated at dispatch),
// no buy/sell, no prediction. Links the live market back to a lesson the user
// has already studied.

export interface EducationalPayload {
  symbol: string;
  conceptTitle: string;
  conceptId: string;
  direction: 'up' | 'down';
  changePct: number;
}

export function educationalTemplate(p: EducationalPayload): {
  title: string;
  body: string;
  data: Record<string, string>;
} {
  const moved = p.direction === 'up' ? 'risen' : 'fallen';
  const pct = Math.abs(p.changePct).toFixed(1);
  return {
    title: `${p.symbol} has ${moved} ${pct}% today`,
    body: `A good moment to revisit "${p.conceptTitle}" and see it play out in the market. Educational simulation — not investment advice.`,
    data: { type: 'educational', conceptId: p.conceptId, symbol: p.symbol, route: '/(tabs)/learn' },
  };
}
