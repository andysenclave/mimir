// Source-of-truth design tokens, locked from the v2 design (mimir-screens.tsx).
// Per CLAUDE.md §14 + prompt 05: components consume these via NativeWind classes
// only — never import this file directly into a component.
// The Tailwind/NativeWind config in `tailwind.config.ts` maps these into
// utility classes (`bg-bg-primary`, `text-gain`, `font-mono`, etc.).

export const tokens = {
  // Surfaces (background layers, darkest → lightest)
  bg: {
    primary: '#09090B',
    secondary: '#111113',
    tertiary: '#18181B',
    hover: '#1F1F23',
  },
  // Borders (3 levels)
  border: {
    subtle: '#1F1F23',
    default: '#27272A',
    strong: '#3F3F46',
  },
  // Text hierarchy
  text: {
    primary: '#FAFAFA',
    secondary: '#A1A1AA',
    tertiary: '#71717A',
  },
  // Semantic
  gain: '#00DC82',
  loss: '#FF3B30',
  accent: '#6366F1',
  accentHover: '#818CF8',
  warning: '#F59E0B',
  info: '#3B82F6',
} as const;

// Font families. We currently use system fonts (RN picks `San Francisco` on iOS,
// `Roboto` on Android by default). Real Inter + JetBrainsMono load via expo-font
// in a follow-up task.
export const fonts = {
  sans: ['System', '-apple-system', 'Inter', 'Roboto', 'sans-serif'],
  mono: ['Menlo', 'SF Mono', 'JetBrainsMono', 'monospace'],
} as const;
