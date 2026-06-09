// CLAUDE.md §9 — hallucination heuristic.
// Cheap anchor check: response must mention the stock symbol OR its sector name.
// If neither appears, the model likely fabricated or responded to the wrong context.

export type HallucinationCheckResult =
  | { ok: true }
  | { ok: false; reason: string };

export function checkAnchors(
  text: string,
  symbol: string,
  sector: string,
): HallucinationCheckResult {
  const lower = text.toLowerCase();
  const hasSymbol = lower.includes(symbol.toLowerCase());
  const hasSector = lower.includes(sector.toLowerCase());
  if (hasSymbol || hasSector) {
    return { ok: true };
  }
  return {
    ok: false,
    reason: `Response mentions neither symbol "${symbol}" nor sector "${sector}"`,
  };
}
