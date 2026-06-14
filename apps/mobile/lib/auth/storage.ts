// MM-009 / ADR-0001 §2 — SecureStore wrappers.
// CLAUDE.md §11 + §14 — tokens live in expo-secure-store ONLY (never MMKV,
// AsyncStorage, console.log). Keys are scoped under `mimir.auth.*`.

import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'mimir.auth.accessToken';
const REFRESH_KEY = 'mimir.auth.refreshToken';

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_KEY);
  },
  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_KEY);
  },
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_KEY, refreshToken),
    ]);
  },
  async clear(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
    ]);
  },
};
