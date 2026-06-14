// Monthly virtual budget tiers per MIMIR-Execution-Plan-v2 §3 (D2) and STORIES.md MM-013.
// All values in INR (₹). CLAUDE.md §5 — `as const` instead of enums.

export const BUDGET_TIERS = {
  TIER_10K: { id: 'TIER_10K', label: '₹10K', amount: 10_000, max: 10_000 },
  TIER_25K: { id: 'TIER_25K', label: '₹25K', amount: 25_000, max: 25_000 },
  TIER_50K: { id: 'TIER_50K', label: '₹50K', amount: 50_000, max: 50_000 },
  TIER_1L: { id: 'TIER_1L', label: '₹1L', amount: 100_000, max: 100_000 },
  CUSTOM: { id: 'CUSTOM', label: 'Custom', amount: 50_000, max: 200_000 },
} as const;

export type BudgetTierId = keyof typeof BUDGET_TIERS;
export type BudgetTier = (typeof BUDGET_TIERS)[BudgetTierId];

export const DEFAULT_BUDGET_TIER: BudgetTierId = 'TIER_50K';
export const CUSTOM_TIER_MIN = 5_000;
export const CUSTOM_TIER_MAX = 200_000;
