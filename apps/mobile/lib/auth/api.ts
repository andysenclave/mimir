// MM-009 / ADR-0001 §2 — REST client for /auth/* endpoints. No raw fetch
// elsewhere in the app (CLAUDE.md §14, prompt 21) — auth is the only allowed
// REST surface and is isolated to this file.

import Constants from 'expo-constants';

import type { Attestations } from './types';

function readEnvUrl(name: string, fallback: string): string {
  const fromExtra = (Constants.expoConfig?.extra as Record<string, string> | undefined)?.[name];
  const fromProcess = (process.env as Record<string, string | undefined>)[name];
  return fromExtra ?? fromProcess ?? fallback;
}

const API_URL = readEnvUrl('EXPO_PUBLIC_API_URL', 'http://localhost:3000/graphql').replace(
  /\/graphql\/?$/,
  '',
);

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    displayName: string | null;
    onboardingDone: boolean;
  };
};

async function request<T>(path: string, body: unknown, accessToken?: string | null): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`auth ${path} failed (${res.status}): ${text}`);
  }
  // /auth/logout returns 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

export const authApi = {
  signup: (email: string, password: string, attestations: Attestations): Promise<AuthResponse> =>
    request<AuthResponse>('/auth/signup', { email, password, ...attestations }),

  login: (email: string, password: string): Promise<AuthResponse> =>
    request<AuthResponse>('/auth/login', { email, password }),

  refresh: (refreshToken: string): Promise<AuthResponse> =>
    request<AuthResponse>('/auth/refresh', { refreshToken }),

  logout: (refreshToken: string, accessToken: string): Promise<void> =>
    request<void>('/auth/logout', { refreshToken }, accessToken),
};
