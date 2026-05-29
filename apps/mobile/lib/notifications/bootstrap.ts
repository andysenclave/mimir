// MM-018 — notifications bootstrap.
// Runs once at app start (called from app/_layout.tsx). Sets up the Android
// channel, the notification handler, and the deep-link router.
// Token registration + soft-prompt happen later via useRegisterPushDevice
// (called explicitly after first paper trade in MM-042).

import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

const ANDROID_CHANNEL_ID = 'mimir-default';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotificationsBootstrap(): void {
  useEffect(() => {
    // Android — default channel must be created before any notification can show.
    if (Platform.OS === 'android') {
      void Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
        name: 'Mimir',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    }

    // Deep-link router: every notification template (MM-027) sets data.route to
    // a valid Mimir route. Tapping a notification routes there.
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      const route = typeof data?.['route'] === 'string' ? data['route'] : null;
      if (route !== null && route.length > 0) {
        // expo-router push accepts arbitrary strings at runtime, but its typed
        // `Href` rejects them statically. Cast through unknown to keep that gate.
        router.push(route as unknown as Parameters<typeof router.push>[0]);
      }
    });

    return () => {
      sub.remove();
    };
  }, []);
}
