// NativeWind v4 + Tailwind config.
// Maps the locked v2 tokens (apps/mobile/theme/tokens.ts) into utility classes
// the rest of the app consumes through className props.

import { tokens, fonts } from './theme/tokens';

import type { Config } from 'tailwindcss';

const config: Config = {
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
        bg: tokens.bg,
        border: tokens.border,
        text: tokens.text,
        gain: tokens.gain,
        loss: tokens.loss,
        accent: {
          DEFAULT: tokens.accent,
          hover: tokens.accentHover,
        },
        warning: tokens.warning,
        info: tokens.info,
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
