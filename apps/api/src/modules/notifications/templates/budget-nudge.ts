// MM-040 — Budget-nudge notification template.
// Triggered when cashRemaining / amount < 30% of the monthly budget.

export interface BudgetNudgePayload {
  cashRemainingInr: number;
  percentLeft: number;
}

export function budgetNudgeTemplate(p: BudgetNudgePayload): {
  title: string;
  body: string;
  data: Record<string, string>;
} {
  const pct = Math.round(p.percentLeft);
  return {
    title: `${pct}% of your virtual budget remains`,
    body: `You have about ${pct}% of this month's budget left to explore. Educational simulation — not investment advice.`,
    data: { type: 'budget_nudge', route: '/(tabs)/portfolio' },
  };
}
