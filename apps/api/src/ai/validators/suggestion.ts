// MM-051 — validation for portfolio learning suggestions (CLAUDE.md §9: mandatory).
// A response is a JSON array of 2–3 cards; every card must pass every check.

import { checkBannedWords } from './banned-words';

import type { ValidationResult } from './index';

// Suggestion copy has stricter vocabulary than stock insights: it must read as a
// learning nudge, never as portfolio advice. "risk"/"invest" are banned here even
// though lesson content may use them.
const SUGGESTION_BANNED: readonly string[] = ['invest', 'investing', 'risk', 'risky', 'risks'];

const CTA_LINK_PATTERN = /^(course|concept):[A-Za-z0-9_-]+$/;

const BODY_MIN_WORDS = 20;
const BODY_MAX_WORDS = 45;
const TITLE_MAX_WORDS = 8;

export interface SuggestionCard {
  title: string;
  body: string;
  ctaLink: string;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function isSuggestionCard(value: unknown): value is SuggestionCard {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as SuggestionCard).title === 'string' &&
    typeof (value as SuggestionCard).body === 'string' &&
    typeof (value as SuggestionCard).ctaLink === 'string'
  );
}

/**
 * Parse + validate the raw LLM response.
 * `allowedCtaIds` are the "course:<id>" / "concept:<id>" links the prompt offered —
 * any ctaLink outside that set is a hallucinated id and fails the whole response.
 */
export function validatePortfolioSuggestions(
  rawText: string,
  allowedCtaIds: ReadonlySet<string>,
): { ok: true; cards: SuggestionCard[] } | { ok: false; reason: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { ok: false, reason: 'Response is not valid JSON' };
  }

  if (!Array.isArray(parsed) || parsed.length < 2 || parsed.length > 3) {
    return { ok: false, reason: 'Response must be a JSON array of 2-3 cards' };
  }

  const cards: SuggestionCard[] = [];
  for (const [i, item] of parsed.entries()) {
    const result = validateCard(item, allowedCtaIds);
    if (!result.ok) return { ok: false, reason: `Card ${i + 1}: ${result.reason}` };
    cards.push(item as SuggestionCard);
  }

  return { ok: true, cards };
}

function validateCard(item: unknown, allowedCtaIds: ReadonlySet<string>): ValidationResult {
  if (!isSuggestionCard(item)) {
    return { ok: false, reason: 'missing title/body/ctaLink string fields' };
  }

  if (item.title.trim().length === 0 || wordCount(item.title) > TITLE_MAX_WORDS) {
    return { ok: false, reason: `title must be 1-${TITLE_MAX_WORDS} words` };
  }

  const bodyWords = wordCount(item.body);
  if (bodyWords < BODY_MIN_WORDS || bodyWords > BODY_MAX_WORDS) {
    return {
      ok: false,
      reason: `body word count ${bodyWords} outside ${BODY_MIN_WORDS}-${BODY_MAX_WORDS} range`,
    };
  }

  const combined = `${item.title} ${item.body}`;
  const banned = checkBannedWords(combined);
  if (!banned.ok) {
    return { ok: false, reason: `contains banned word: "${banned.word}"` };
  }
  const lower = combined.toLowerCase();
  for (const word of SUGGESTION_BANNED) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(lower)) {
      return { ok: false, reason: `contains banned word: "${word}"` };
    }
  }

  if (!CTA_LINK_PATTERN.test(item.ctaLink)) {
    return { ok: false, reason: `ctaLink "${item.ctaLink}" malformed` };
  }
  if (!allowedCtaIds.has(item.ctaLink)) {
    return { ok: false, reason: `ctaLink "${item.ctaLink}" not in the offered course/concept set` };
  }

  return { ok: true };
}
