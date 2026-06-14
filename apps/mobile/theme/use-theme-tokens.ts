// MM-076 — returns the hex token palette matching the active color scheme.
// Use this for NATIVE color props (Lucide icon `color`, Victory chart colors,
// RefreshControl tint, bottom-sheet backgrounds, StatusBar) that can't consume
// NativeWind classes / CSS variables. className styling needs no hook.
//
// Reads the resolved scheme from ThemeProvider (React state) so it re-renders
// reliably on theme change — not from NativeWind's colorScheme, whose runtime
// reactivity for CSS-var styling is unreliable in v4.

import { darkTokens, lightTokens } from './tokens';

import { useThemeScheme } from '@/lib/theme/ThemeProvider';

export function useThemeTokens(): typeof darkTokens {
  return useThemeScheme() === 'light' ? lightTokens : darkTokens;
}
