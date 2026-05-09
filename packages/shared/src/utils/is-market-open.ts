import { MARKET_HOURS_IST, NSE_HOLIDAYS_2026 } from '../constants/market-hours';

// Pure function — accepts an injectable `now` for tests.
// CLAUDE.md §6 — no runtime deps; no side effects.
export function isMarketOpen(now: Date = new Date()): boolean {
  // Convert to IST.
  const istNow = new Date(now.toLocaleString('en-US', { timeZone: MARKET_HOURS_IST.TIMEZONE }));
  const dow = istNow.getDay(); // 0 = Sun, 6 = Sat
  if (dow === 0 || dow === 6) return false;

  const ymd = istNow.toISOString().slice(0, 10);
  if ((NSE_HOLIDAYS_2026 as readonly string[]).includes(ymd)) return false;

  const minutesNow = istNow.getHours() * 60 + istNow.getMinutes();
  const open = MARKET_HOURS_IST.OPEN_HH * 60 + MARKET_HOURS_IST.OPEN_MM;
  const close = MARKET_HOURS_IST.CLOSE_HH * 60 + MARKET_HOURS_IST.CLOSE_MM;
  return minutesNow >= open && minutesNow <= close;
}
