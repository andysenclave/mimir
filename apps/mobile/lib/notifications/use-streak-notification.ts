// MM-039 — Local streak notification hook.
// Runs on every app foreground. Schedules an expo-notifications local trigger
// for 8 PM IST if the user hasn't opened the app today.
//
// Respects NotificationPreferences.streakEnabled — if disabled, cancels any
// scheduled streak notifications instead of scheduling new ones.
//
// Storage: expo-secure-store (already installed, works in Expo Go).
// Key: 'streak_last_opened_date' — stores 'YYYY-MM-DD' IST. Not sensitive, but
// SecureStore is the only available persistent key-value store until a dev-client
// build enables react-native-mmkv. (CLAUDE.md §14 — swap to MMKV when native build lands.)
//
// Deep-link on tap: data.route = '/(tabs)/portfolio' — handled by useNotificationsBootstrap.

import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef } from 'react';

import { todayIst, secondsUntilNextStreak } from './streak-schedule';

const SECURE_STORE_KEY = 'streak_last_opened_date';
const STREAK_NOTIFICATION_ID = 'mimir-streak-reminder';

interface UseStreakNotificationOptions {
  /** From me.streakCount — shown in notification body. */
  streakCount: number;
  /** From NotificationPreferences.streakEnabled. */
  streakEnabled: boolean;
}

export function useStreakNotification({
  streakCount,
  streakEnabled,
}: UseStreakNotificationOptions): void {
  const scheduledRef = useRef(false);

  useEffect(() => {
    if (scheduledRef.current) return;
    scheduledRef.current = true;

    void scheduleOrCancel(streakCount, streakEnabled);
  }, [streakCount, streakEnabled]);
}

async function scheduleOrCancel(streakCount: number, streakEnabled: boolean): Promise<void> {
  if (!streakEnabled) {
    await Notifications.cancelScheduledNotificationAsync(STREAK_NOTIFICATION_ID).catch(() => {});
    return;
  }

  const today = todayIst();
  const lastOpened = await SecureStore.getItemAsync(SECURE_STORE_KEY);

  // Update last-opened to today.
  await SecureStore.setItemAsync(SECURE_STORE_KEY, today);

  if (lastOpened === today) {
    // Already opened today — cancel any pending reminder.
    await Notifications.cancelScheduledNotificationAsync(STREAK_NOTIFICATION_ID).catch(() => {});
    return;
  }

  // Not opened today (or first launch) — schedule streak reminder for 8 PM IST.
  const seconds = secondsUntilNextStreak();

  const body =
    streakCount > 0
      ? `You are on a ${streakCount}-day streak. Come check today's market.`
      : "Start your streak today. Come check today's market.";

  await Notifications.scheduleNotificationAsync({
    identifier: STREAK_NOTIFICATION_ID,
    content: {
      title: 'Keep your streak alive 🔥', // 🔥 — only emoji allowed per REFERENCE.md §3.7
      body,
      data: { type: 'streak', route: '/(tabs)/portfolio' },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
    },
  });
}
