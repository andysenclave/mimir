// Pure helper — scores a password from 0 (none) to 4 (strong) with a label.
// Used by the PasswordStrength meter. CLAUDE.md §6 — pure, no side effects.

export type PasswordStrengthScore = 0 | 1 | 2 | 3 | 4;
export type PasswordStrengthLabel = 'none' | 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrength {
  score: PasswordStrengthScore;
  label: PasswordStrengthLabel;
}

const LABELS: PasswordStrengthLabel[] = ['none', 'weak', 'fair', 'good', 'strong'];

export function scorePassword(password: string): PasswordStrength {
  if (password.length === 0) return { score: 0, label: 'none' };

  let score = 0;
  if (password.length >= 10) score += 1;
  if (password.length >= 14) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

  // Clamp to 0-4 inclusive.
  const clamped = Math.max(0, Math.min(4, score)) as PasswordStrengthScore;
  return { score: clamped, label: LABELS[clamped] ?? 'none' };
}
