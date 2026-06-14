// MM-007 — auth + error links.
// CLAUDE.md §13 — errorLink handles 401 (5xx → toast + Sentry, 4xx → form-level
// inline errors). On UNAUTHENTICATED it signals the AuthProvider to sign the user
// out (via session-events), which flips isAuthenticated so the route guards
// redirect to /login. Refresh-then-retry is the MM-009 follow-up.

import {
  ApolloLink,
  Observable,
  type FetchResult,
  type NextLink,
  type Operation,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

import { emitSessionExpired } from '../auth/session-events';
import { tokenStorage } from '../auth/storage';

export const authLink = setContext(async (_op, prevContext) => {
  const token = await tokenStorage.getAccessToken();
  return {
    ...prevContext,
    headers: {
      ...(prevContext.headers as Record<string, string> | undefined),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

export const errorLink: ApolloLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        // CLAUDE.md §13 — extension code is the stable contract.
        const code = (err.extensions?.code as string | undefined) ?? 'UNKNOWN';
        if (code === 'UNAUTHENTICATED') {
          // Session expired / token invalid. Tell the AuthProvider to sign out
          // locally → isAuthenticated flips false → the (tabs) guard redirects
          // to /login. (Idempotent: many in-flight queries may 401 at once.)
          emitSessionExpired();
        }

        if (__DEV__) console.warn(`[apollo] ${code}: ${err.message} @ ${operation.operationName}`);
      }
    }
    if (networkError && __DEV__) {
      console.warn(`[apollo] network: ${networkError.message}`);
    }
    return retryOnce(operation, forward);
  },
);

// Skeleton retry helper — left as a no-op until MM-009 hooks in real refresh.
function retryOnce(_operation: Operation, _forward: NextLink): Observable<FetchResult> | undefined {
  return undefined;
}
