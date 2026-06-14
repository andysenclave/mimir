// MM-076 — status bar icons follow the resolved theme scheme.
// Must render inside ThemeProvider (reads the scheme context).

import { StatusBar } from 'expo-status-bar';

import { useThemeScheme } from './ThemeProvider';

export function ThemedStatusBar(): React.JSX.Element {
  const scheme = useThemeScheme();
  return <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />;
}
