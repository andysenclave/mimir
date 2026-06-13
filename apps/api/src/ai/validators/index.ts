// Aggregated validator — runs all checks in sequence.
// Callers should use validateStockInsight(); individual validators are exported
// for unit tests and future custom pipelines.

import { checkBannedWords } from './banned-words';
import { checkAnchors } from './hallucination';
import { checkLength } from './length';

export { checkBannedWords } from './banned-words';
export { checkLength } from './length';
export { checkAnchors } from './hallucination';
export { validatePortfolioSuggestions, type SuggestionCard } from './suggestion';

export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

export function validateStockInsight(
  text: string,
  symbol: string,
  sector: string,
): ValidationResult {
  const length = checkLength(text);
  if (!length.ok) {
    return { ok: false, reason: `Word count ${length.wordCount} outside 40–80 range` };
  }

  const banned = checkBannedWords(text);
  if (!banned.ok) {
    return { ok: false, reason: `Contains banned word: "${banned.word}"` };
  }

  const anchors = checkAnchors(text, symbol, sector);
  if (!anchors.ok) {
    return { ok: false, reason: anchors.reason };
  }

  return { ok: true };
}
