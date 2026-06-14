// Session-expiry bridge between the Apollo errorLink (outside React) and the
// AuthProvider (inside React). The error link can't touch React state or the
// router, so on an UNAUTHENTICATED response it emits here; the AuthProvider
// subscribes and runs a local sign-out, which flips isAuthenticated → the route
// guards redirect to /login. Without this, an expired session clears tokens but
// leaves isAuthenticated=true, trapping the user (can't sign out, can't re-login).

type Listener = () => void;

let listeners: Listener[] = [];

/** Subscribe to session-expired events. Returns an unsubscribe fn. */
export function onSessionExpired(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

/** Fire a session-expired event. Safe to call repeatedly (handlers are idempotent). */
export function emitSessionExpired(): void {
  for (const listener of listeners) listener();
}
