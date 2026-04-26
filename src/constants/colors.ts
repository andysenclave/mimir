/**
 * Color palette for Mimir application
 * Supports both light and dark modes
 */

export const colors = {
  // Primary brand colors
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  primaryLight: '#60a5fa',

  // Semantic colors
  success: '#16a34a',
  error: '#dc2626',
  warning: '#ea580c',
  info: '#0891b2',

  // Neutral colors
  black: '#000000',
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  // Dark mode specific
  darkBg: '#0f172a',
  darkBgSecondary: '#1a1a2e',
  darkBorder: '#2d3748',
  darkText: '#e2e8f0',
  darkTextSecondary: '#a0aec0',

  // Light mode specific
  lightBg: '#ffffff',
  lightBgSecondary: '#f8fafc',
  lightBorder: '#e2e8f0',
  lightText: '#0f172a',
  lightTextSecondary: '#475569',
};

export const themeColors = {
  light: {
    background: colors.lightBg,
    secondaryBackground: colors.lightBgSecondary,
    text: colors.lightText,
    secondaryText: colors.lightTextSecondary,
    border: colors.lightBorder,
    tint: colors.primary,
  },
  dark: {
    background: colors.darkBg,
    secondaryBackground: colors.darkBgSecondary,
    text: colors.darkText,
    secondaryText: colors.darkTextSecondary,
    border: colors.darkBorder,
    tint: colors.primaryLight,
  },
};
