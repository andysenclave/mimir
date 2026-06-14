// Design tokens (MM-076: light + dark).
//
// Two jobs:
//   1. NativeWind className styling (`bg-bg-primary`, `text-gain`, …) resolves
//      via CSS variables defined in `global.css` (`:root` light / `.dark:root`
//      dark) — so className-styled components re-theme with ZERO per-component
//      edits. tailwind.config maps each color to `rgb(var(--color-…))`.
//   2. Native color props (Lucide icon `color`, Victory charts, RefreshControl
//      tint, bottom-sheet backgrounds, StatusBar) can't read CSS vars — they
//      read the hex objects below via the `useThemeTokens()` hook, which returns
//      the palette matching the active color scheme.
//
// The CSS-variable RGB triplets in `global.css` MUST stay in sync with the hex
// values here (same palette, two representations).

interface Palette {
  bg: { primary: string; secondary: string; tertiary: string; hover: string };
  border: { subtle: string; default: string; strong: string };
  text: { primary: string; secondary: string; tertiary: string };
  gain: string;
  loss: string;
  accent: string;
  accentHover: string;
  warning: string;
  info: string;
}

// Dark — the v2 design's primary palette (mimir-screens.tsx).
export const darkTokens: Palette = {
  bg: { primary: '#09090B', secondary: '#111113', tertiary: '#18181B', hover: '#1F1F23' },
  border: { subtle: '#1F1F23', default: '#27272A', strong: '#3F3F46' },
  text: { primary: '#FAFAFA', secondary: '#A1A1AA', tertiary: '#71717A' },
  gain: '#00DC82',
  loss: '#FF3B30',
  accent: '#6366F1',
  accentHover: '#818CF8',
  warning: '#F59E0B',
  info: '#3B82F6',
};

// Light — mirrors the dark palette; semantics adjusted for contrast on light
// surfaces (WCAG AA): gain/loss/accent/warning/info use darker cuts.
export const lightTokens: Palette = {
  bg: { primary: '#FFFFFF', secondary: '#F7F7F8', tertiary: '#EFEFF1', hover: '#E4E4E7' },
  border: { subtle: '#ECECEE', default: '#E0E0E3', strong: '#C8C8CD' },
  text: { primary: '#18181B', secondary: '#52525B', tertiary: '#8A8A93' },
  gain: '#059669',
  loss: '#DC2626',
  accent: '#4F46E5',
  accentHover: '#6366F1',
  warning: '#D97706',
  info: '#2563EB',
};

// Back-compat default export. Components not yet migrated to useThemeTokens()
// fall back to dark values (a visual nit in light mode, never a crash). Prefer
// `useThemeTokens()` for any native color prop.
export const tokens = darkTokens;

// Font families. Inter (sans) + JetBrains Mono (numerics) load via expo-font on
// boot — see `theme/fonts.ts`. The 400 cut is the base family name.
export const fonts = {
  sans: ['Inter_400Regular', 'System', '-apple-system', 'Roboto', 'sans-serif'],
  mono: ['JetBrainsMono_400Regular', 'Menlo', 'SF Mono', 'monospace'],
} as const;
