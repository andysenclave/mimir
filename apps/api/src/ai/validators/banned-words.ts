// CLAUDE.md §9 — banned-word filter. Validation is mandatory on every LLM response.
// The base list comes from @mimir/shared; the AI pipeline adds finance-specific extras
// that don't need to live in the cross-app package.

import { BANNED_AI_WORDS } from '@mimir/shared';

const ADDITIONAL_FINANCE_BANNED: readonly string[] = [
  'purchase',
  'exit',
  'enter',
  'load up',
  'trim',
  'target price',
  'will reach',
  'will hit',
  'outperform',
  'underperform',
  'overweight',
  'underweight',
  'strong buy',
  'strong sell',
  'hold',
  'accumulate',
] as const;

const ALL_BANNED_WORDS: readonly string[] = [
  ...BANNED_AI_WORDS,
  ...ADDITIONAL_FINANCE_BANNED,
];

export type BannedWordCheckResult =
  | { ok: true }
  | { ok: false; word: string };

export function checkBannedWords(text: string): BannedWordCheckResult {
  const lower = text.toLowerCase();
  for (const word of ALL_BANNED_WORDS) {
    // Use word-boundary regex so "sell" doesn't match "bestseller"
    const pattern = new RegExp(`\\b${word.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (pattern.test(lower)) {
      return { ok: false, word };
    }
  }
  return { ok: true };
}
