// Single source of truth for the backend URL on mobile.
//
// In dev the API runs on the dev machine. We derive the host from the LIVE Metro
// host (`Constants.expoConfig.hostUri`, e.g. "192.168.29.171:8081") — the
// authoritative current LAN IP — and use port 3000. This is preferred over any
// explicit EXPO_PUBLIC_API_URL because that value gets baked into
// `expoConfig.extra` and goes STALE when DHCP hands the Mac a new IP (the cause
// of the "Network request timed out" outage: app hit an old .82 while the Mac
// had moved to .171). `localhost` only works on the iOS Simulator, never a real
// device, so we never derive `localhost` from hostUri.
//
// In production (no Metro host) we fall back to the explicit env, then localhost.

import Constants from 'expo-constants';

const API_PORT = 3000;

function explicitEnv(name: string): string | undefined {
  const fromExtra = (Constants.expoConfig?.extra as Record<string, string> | undefined)?.[name];
  const fromProcess = (process.env as Record<string, string | undefined>)[name];
  return fromExtra ?? fromProcess ?? undefined;
}

/** The dev machine's LAN host Metro is served from (no port), or undefined in prod. */
function devHost(): string | undefined {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost;
  const host = hostUri?.split(':')[0];
  return host !== undefined && host.length > 0 && host !== 'localhost' ? host : undefined;
}

/**
 * Resolve a backend URL for the given scheme + path.
 * Dev: live Metro host wins (always current). Prod: explicit env, else localhost.
 */
export function resolveApiUrl(scheme: 'http' | 'ws', path: string, envName: string): string {
  const host = devHost();
  if (host !== undefined) return `${scheme}://${host}:${API_PORT}${path}`;
  return explicitEnv(envName) ?? `${scheme}://localhost:${API_PORT}${path}`;
}
