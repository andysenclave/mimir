// CLAUDE.md §9 — length validation. 40–80 words per spec (prompt says 40–60 for the
// model; we validate 40–80 to allow one sentence of natural overage without retry).

export type LengthCheckResult =
  | { ok: true; wordCount: number }
  | { ok: false; wordCount: number };

export function checkLength(text: string): LengthCheckResult {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount >= 40 && wordCount <= 80) {
    return { ok: true, wordCount };
  }
  return { ok: false, wordCount };
}
