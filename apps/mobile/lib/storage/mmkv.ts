// MMKV wrapper — placeholder until a native dev-client build is available.
// react-native-mmkv requires native linking and cannot run in Expo Go.
// For now this module is intentionally empty; callers that need persistent
// non-sensitive storage use expo-secure-store directly (see use-streak-notification.ts).
//
// When a dev-client build is confirmed, restore:
//   import { createMMKV } from 'react-native-mmkv';
//   export const mmkv = createMMKV({ id: 'mimir-ui-cache' });
export {};
