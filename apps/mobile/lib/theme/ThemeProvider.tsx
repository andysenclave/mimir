// MM-076 — theme preference provider + reactive theme application.
//
// Holds the user's system|light|dark choice (persisted), resolves it against the
// device scheme for "system", and applies the matching `vars()` to a root View so
// the whole tree re-themes reactively on change. Also mirrors the choice into
// NativeWind's `colorScheme` (for the global.css fallback + any `dark:` usage).

import { colorScheme as nativewindColorScheme } from 'nativewind';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme as useDeviceColorScheme, View } from 'react-native';

import { loadThemePreference, persistThemePreference, type ThemePref } from './theme-preference';

import { themeVars } from '@/theme/theme-vars';

export type ResolvedScheme = 'light' | 'dark';

interface ThemeContextValue {
  pref: ThemePref;
  /** Effective scheme after resolving "system" against the device. */
  scheme: ResolvedScheme;
  setPref: (pref: ThemePref) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  pref: 'system',
  scheme: 'dark',
  setPref: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const deviceScheme = useDeviceColorScheme(); // 'light' | 'dark' | null
  const [pref, setPrefState] = useState<ThemePref>('system');

  useEffect(() => {
    void loadThemePreference().then((stored) => {
      setPrefState(stored);
      nativewindColorScheme.set(stored);
    });
  }, []);

  const setPref = useCallback((next: ThemePref) => {
    setPrefState(next);
    nativewindColorScheme.set(next);
    void persistThemePreference(next);
  }, []);

  const scheme: ResolvedScheme =
    pref === 'system' ? (deviceScheme === 'light' ? 'light' : 'dark') : pref;

  const value = useMemo<ThemeContextValue>(
    () => ({ pref, scheme, setPref }),
    [pref, scheme, setPref],
  );

  return (
    <ThemeContext.Provider value={value}>
      {/* Reactive theme scope: descendants resolve rgb(var(--color-…)) from here. */}
      <View style={themeVars[scheme]} className="flex-1">
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useThemePreference(): ThemeContextValue {
  return useContext(ThemeContext);
}

/** Resolved 'light' | 'dark' — drives native color props via useThemeTokens(). */
export function useThemeScheme(): ResolvedScheme {
  return useContext(ThemeContext).scheme;
}
