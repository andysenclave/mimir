// MM-009 / ADR-0001 §2 — AuthProvider.
// Wraps the entire app. Exposes useAuth() with the AuthAPI shape.
// On mount: hydrate user from stored access token (if present).
// signUp/signIn: call REST → store tokens → set user → identify analytics.
// signOut: revoke token + reset analytics + clear Sentry user.
//
// ┌────────────────────────────────────────────────────────────────────────────┐
// │ TODO — SWAP TO @andysenclave/heimdal-rn (MM-S2-AUTH-SWAP, ADR-0001 §3).   │
// │ Real Heimdal SDK packages confirmed available:                             │
// │   @andysenclave/heimdal-rn   (mobile)                                      │
// │   @andysenclave/heimdal-nest (backend)                                     │
// │ Detailed swap diff: _sprint-1-scaffold/HEIMDAL-SWAP-PLAN.md                │
// │ This file becomes a thin re-export of HeimdalProvider/useAuth from the     │
// │ SDK; the AuthAPI surface in ./types.ts does not change so screens are      │
// │ untouched.                                                                 │
// └────────────────────────────────────────────────────────────────────────────┘

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { authApi } from './api';
import { tokenStorage } from './storage';

import type { AuthAPI, Attestations } from './types';
import type { AuthUser } from '@mimir/shared';

import { identifyUser, resetAnalytics } from '@/lib/analytics/init';
import { setSentryUser } from '@/lib/sentry/init';

const AuthContext = createContext<AuthAPI | null>(null);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>): React.JSX.Element {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydration: on mount, if we have an access token assume signed-in. Validation
  // happens on first authenticated GraphQL call (errorLink handles 401 cleanup).
  // The (tabs) / (onboarding) layouts can refetch /me as needed once mounted.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const token = await tokenStorage.getAccessToken();
      if (cancelled) return;
      if (!token) {
        setIsLoading(false);
        return;
      }
      // MM-013 me query hydrates the real user. Until that runs, keep a
      // placeholder so isAuthenticated is true and route guards behave.
      setUser({
        id: 'user_pending_me_query',
        email: '',
        displayName: null,
        onboardingDone: true,
      });
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyIdentity = useCallback((next: AuthUser) => {
    setUser(next);
    identifyUser(next.id);
    setSentryUser(next.id);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      await tokenStorage.setTokens(res.accessToken, res.refreshToken);
      applyIdentity(res.user);
    },
    [applyIdentity],
  );

  const signUp = useCallback(
    async (email: string, password: string, attestations: Attestations) => {
      const res = await authApi.signup(email, password, attestations);
      await tokenStorage.setTokens(res.accessToken, res.refreshToken);
      applyIdentity(res.user);
    },
    [applyIdentity],
  );

  const signInWithGoogle = useCallback(async () => {
    throw new Error('Google sign-in lands in MM-S2-AUTH-SWAP');
  }, []);

  const signInWithApple = useCallback(async () => {
    throw new Error('Apple sign-in lands in MM-S2-AUTH-SWAP');
  }, []);

  const signOut = useCallback(async () => {
    const accessToken = await tokenStorage.getAccessToken();
    const refreshToken = await tokenStorage.getRefreshToken();
    if (accessToken && refreshToken) {
      try {
        await authApi.logout(refreshToken, accessToken);
      } catch {
        // best-effort; clear locally regardless
      }
    }
    await tokenStorage.clear();
    setUser(null);
    resetAnalytics();
    setSentryUser(null);
  }, []);

  const updateUser = useCallback((partial: Partial<AuthUser> & { id: string }) => {
    setUser((current) => {
      if (current === null) {
        return {
          id: partial.id,
          email: partial.email ?? '',
          displayName: partial.displayName ?? null,
          onboardingDone: partial.onboardingDone ?? false,
        };
      }
      return { ...current, ...partial };
    });
  }, []);

  const value = useMemo<AuthAPI>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      signIn,
      signUp,
      signInWithGoogle,
      signInWithApple,
      signOut,
      updateUser,
    }),
    [user, isLoading, signIn, signUp, signInWithGoogle, signInWithApple, signOut, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthAPI {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
