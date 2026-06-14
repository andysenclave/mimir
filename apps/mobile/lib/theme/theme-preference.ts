// MM-076 — persisted theme preference (system | light | dark).
// Stored in expo-secure-store (MMKV is stubbed in Expo Go; the pref is
// non-sensitive but SecureStore is already wired and dependency-free).

import * as SecureStore from 'expo-secure-store';

export const THEME_PREFS = ['system', 'light', 'dark'] as const;
export type ThemePref = (typeof THEME_PREFS)[number];

const KEY = 'mimir.theme.pref';

function isThemePref(v: string | null): v is ThemePref {
  return v === 'system' || v === 'light' || v === 'dark';
}

export async function loadThemePreference(): Promise<ThemePref> {
  try {
    const stored = await SecureStore.getItemAsync(KEY);
    return isThemePref(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

export async function persistThemePreference(pref: ThemePref): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY, pref);
  } catch {
    // Non-fatal — the in-memory pref still applies for this session.
  }
}
