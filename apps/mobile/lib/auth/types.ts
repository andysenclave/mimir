// MM-009 / ADR-0001 §2 — AuthAPI interface designed identical to the eventual
// @andysenclave/heimdal-rn shape so the Sprint 2 swap is a localised refactor.

import type { AuthUser } from '@mimir/shared';

export type Attestations = {
  ageAttested: true;
  termsAccepted: true;
};

export interface AuthAPI {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, attestations: Attestations) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
}
