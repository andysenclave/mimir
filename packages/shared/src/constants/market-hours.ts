// NSE market hours in IST (Asia/Kolkata). Pre-open + special sessions handled at the worker layer (MM-021).
// CLAUDE.md §6 — pure constants, no runtime deps.

export const MARKET_HOURS_IST = {
  OPEN_HH: 9,
  OPEN_MM: 15,
  CLOSE_HH: 15,
  CLOSE_MM: 30,
  TIMEZONE: 'Asia/Kolkata',
} as const;

// 2026 NSE holidays — bootstrap calendar.
// Full list maintained in apps/api/src/market/calendar.ts from MM-021.
// Format: YYYY-MM-DD (IST date).
export const NSE_HOLIDAYS_2026 = [
  '2026-01-26', // Republic Day
  // TODO MM-021: complete annual calendar from NSE notice.
] as const;
