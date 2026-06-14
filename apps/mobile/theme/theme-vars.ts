// MM-076 — reactive theme variables (NativeWind `vars()`).
// Applied as an inline style on a root View by ThemeProvider; when the active
// scheme changes, the View re-renders with new values and every descendant that
// resolves `rgb(var(--color-…))` updates immediately. This is the reliable
// runtime-switching path in NativeWind v4 ( `:root`/`.dark:root` in the CSS file
// resolves only at mount and does NOT re-theme already-mounted screens).
//
// Values are RGB triplets and MUST mirror the hex palettes in tokens.ts and the
// fallback blocks in global.css.

import { vars } from 'nativewind';

export const themeVars = {
  light: vars({
    '--color-bg-primary': '255 255 255',
    '--color-bg-secondary': '247 247 248',
    '--color-bg-tertiary': '239 239 241',
    '--color-bg-hover': '228 228 231',
    '--color-border-subtle': '236 236 238',
    '--color-border-default': '224 224 227',
    '--color-border-strong': '200 200 205',
    '--color-text-primary': '24 24 27',
    '--color-text-secondary': '82 82 91',
    '--color-text-tertiary': '138 138 147',
    '--color-gain': '5 150 105',
    '--color-loss': '220 38 38',
    '--color-accent': '79 70 229',
    '--color-accent-hover': '99 102 241',
    '--color-warning': '217 119 6',
    '--color-info': '37 99 235',
  }),
  dark: vars({
    '--color-bg-primary': '9 9 11',
    '--color-bg-secondary': '17 17 19',
    '--color-bg-tertiary': '24 24 27',
    '--color-bg-hover': '31 31 35',
    '--color-border-subtle': '31 31 35',
    '--color-border-default': '39 39 42',
    '--color-border-strong': '63 63 70',
    '--color-text-primary': '250 250 250',
    '--color-text-secondary': '161 161 170',
    '--color-text-tertiary': '113 113 122',
    '--color-gain': '0 220 130',
    '--color-loss': '255 59 48',
    '--color-accent': '99 102 241',
    '--color-accent-hover': '129 140 248',
    '--color-warning': '245 158 11',
    '--color-info': '59 130 246',
  }),
} as const;
