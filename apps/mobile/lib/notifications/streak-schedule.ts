// MM-039 — Streak notification schedule utilities.
// All functions are pure and testable — no imports from React Native.

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const STREAK_HOUR_IST = 20; // 8 PM IST
const STREAK_MIN_IST = 0;

/** Returns the current date in IST as a 'YYYY-MM-DD' string. */
export function todayIst(now: Date = new Date()): string {
  const istMs = now.getTime() + IST_OFFSET_MS;
  return new Date(istMs).toISOString().slice(0, 10);
}

/**
 * Returns the next 8 PM IST trigger time as a Date.
 * If it's already past 8 PM IST today, returns tomorrow's 8 PM IST.
 */
export function nextStreakTrigger(now: Date = new Date()): Date {
  const istMs = now.getTime() + IST_OFFSET_MS;
  const istDate = new Date(istMs);

  // Build 8 PM IST for today in UTC.
  const triggerUtcMs =
    Date.UTC(
      istDate.getUTCFullYear(),
      istDate.getUTCMonth(),
      istDate.getUTCDate(),
      STREAK_HOUR_IST,
      STREAK_MIN_IST,
      0,
    ) - IST_OFFSET_MS;

  if (triggerUtcMs <= now.getTime()) {
    // Already past 8 PM IST today — schedule for tomorrow.
    return new Date(triggerUtcMs + 24 * 60 * 60 * 1000);
  }
  return new Date(triggerUtcMs);
}

/** Number of seconds from `now` until the next 8 PM IST. */
export function secondsUntilNextStreak(now: Date = new Date()): number {
  const trigger = nextStreakTrigger(now);
  return Math.max(1, Math.floor((trigger.getTime() - now.getTime()) / 1000));
}
