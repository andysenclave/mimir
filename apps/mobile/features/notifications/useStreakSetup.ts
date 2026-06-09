// MM-039 — Wires streak notification hook to live server data.
// Called once from the (tabs) layout so it only runs when the user is authenticated.
// Reads streakCount from the me query + streakEnabled from NotificationPreferences.

import { useMeQuery, useNotificationPreferencesQuery } from '@/graphql/generated';
import { useStreakNotification } from '@/lib/notifications/use-streak-notification';

export function useStreakSetup(): void {
  const { data: meData } = useMeQuery({ fetchPolicy: 'cache-only' });
  const { data: prefsData } = useNotificationPreferencesQuery({ fetchPolicy: 'cache-and-network' });

  const streakCount = 0; // me.streakCount not yet in GQL schema — Phase 1 default
  void meData; // consumed via streakCount above once schema is extended

  const streakEnabled = prefsData?.notificationPreferences.streakEnabled ?? true;

  useStreakNotification({ streakCount, streakEnabled });
}
