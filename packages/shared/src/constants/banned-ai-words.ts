// CLAUDE.md §9 — words the AI insight pipeline must never produce.
// Validated against by apps/api/src/ai/validators/. Full enforcement in MM-032.
// Reproduced here so mobile (e.g., feedback widgets) can also reference it.

export const BANNED_AI_WORDS = [
  'buy',
  'sell',
  'should',
  'must',
  'will reach',
  'will hit',
  'expected to',
  'guaranteed',
  'recommended',
  'advice',
  'broker',
] as const;

export type BannedAiWord = (typeof BANNED_AI_WORDS)[number];
