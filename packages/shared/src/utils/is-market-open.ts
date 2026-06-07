import { MARKET_HOURS_IST, NSE_HOLIDAYS_2026 } from '../constants/market-hours';

// IST is UTC+5:30 with no DST — fixed offset always.
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

// Pure function — accepts an injectable `now` for tests.
// CLAUDE.md §6 — no runtime deps; no side effects.
//
// Implementation note: we avoid new Date(toLocaleString(...)) because that
// pattern re-parses a locale string with new Date(), which produces an invalid
// Date on iOS / React Native (RangeError). Instead we shift the UTC timestamp
// by the fixed IST offset and read UTC methods — equivalent and portable.
export function isMarketOpen(now: Date = new Date()): boolean {
  // Shift UTC timestamp to IST, then read as UTC fields.
  const istNow = new Date(now.getTime() + IST_OFFSET_MS);

  const dow = istNow.getUTCDay(); // 0 = Sun, 6 = Sat
  if (dow === 0 || dow === 6) return false;

  // toISOString() is always safe here — istNow is constructed from a valid number.
  const ymd = istNow.toISOString().slice(0, 10);
  if ((NSE_HOLIDAYS_2026 as readonly string[]).includes(ymd)) return false;

  const minutesNow = istNow.getUTCHours() * 60 + istNow.getUTCMinutes();
  const open = MARKET_HOURS_IST.OPEN_HH * 60 + MARKET_HOURS_IST.OPEN_MM;
  const close = MARKET_HOURS_IST.CLOSE_HH * 60 + MARKET_HOURS_IST.CLOSE_MM;
  return minutesNow >= open && minutesNow <= close;
}
