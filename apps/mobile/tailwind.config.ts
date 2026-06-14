// NativeWind v4 + Tailwind config.
// MM-076: colors resolve via CSS variables (global.css `:root` light /
// `.dark:root` dark) so every className-styled component re-themes with no
// per-component edits. `darkMode: 'class'` lets NativeWind toggle the scheme.

import { fonts } from './theme/tokens';

import type { Config } from 'tailwindcss';

/** rgb(var(--color-X) / <alpha-value>) so slash-opacity utilities still work. */
const v = (name: string): string => `rgb(var(--color-${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: v('bg-primary'),
          secondary: v('bg-secondary'),
          tertiary: v('bg-tertiary'),
          hover: v('bg-hover'),
        },
        // Semantic surface aliases consumed across the app (cards, list rows).
        surface: {
          elevated: v('bg-secondary'),
          hover: v('bg-hover'),
        },
        border: {
          subtle: v('border-subtle'),
          default: v('border-default'),
          strong: v('border-strong'),
        },
        text: {
          primary: v('text-primary'),
          secondary: v('text-secondary'),
          tertiary: v('text-tertiary'),
        },
        gain: v('gain'),
        loss: v('loss'),
        accent: {
          DEFAULT: v('accent'),
          hover: v('accent-hover'),
        },
        warning: v('warning'),
        info: v('info'),
      },
      fontFamily: {
        sans: fonts.sans as unknown as string[],
        mono: fonts.mono as unknown as string[],
      },
      borderRadius: {
        // 4-step radius scale used across the v2 design.
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '14px',
        '2xl': '16px',
        full: '9999px',
      },
    },
  },
  plugins: [],
};

export default config;
