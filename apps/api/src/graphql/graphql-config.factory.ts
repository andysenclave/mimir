// CLAUDE.md §3 — code-first GraphQL with autoSchemaFile, depth + complexity
// limits, graphql-ws subscriptions. Per CLAUDE.md §11 + ADR-0001, subscription
// auth is validated once at WS handshake via connectionParams.

import path from 'node:path';

import { GraphQLError } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { getComplexity, simpleEstimator } from 'graphql-query-complexity';

import type { ApolloServerPlugin } from '@apollo/server';
import type { ApolloDriverConfig } from '@nestjs/apollo';

// CLAUDE.md §3 — hard query-shape limits (MM-064 security audit).
const MAX_QUERY_DEPTH = 10;
const MAX_QUERY_COMPLEXITY = 1000;

// Complexity must run as a PLUGIN, not a static validationRule. As a validation
// rule, graphql-query-complexity has no access to per-request variables and its
// variable coercion throws "Variable $x not provided" for EVERY query that
// declares a required variable (it breaks all parameterised queries). The plugin
// receives request.variables, so coercion succeeds. (Bug fix: stock detail 400s.)
const complexityPlugin: ApolloServerPlugin = {
  async requestDidStart() {
    return {
      async didResolveOperation({ schema, document, request, operationName }) {
        const complexity = getComplexity({
          schema,
          query: document,
          variables: request.variables,
          ...(operationName ? { operationName } : {}),
          estimators: [simpleEstimator({ defaultComplexity: 1 })],
        });
        if (complexity > MAX_QUERY_COMPLEXITY) {
          throw new GraphQLError(
            `Query is too complex: ${complexity}. Maximum allowed is ${MAX_QUERY_COMPLEXITY}.`,
            { extensions: { code: 'QUERY_TOO_COMPLEX' } },
          );
        }
      },
    };
  },
};

// Always resolve the SDL emit path from the workspace root so dev + build both
// land it inside packages/graphql-schema. NestJS compiles to CommonJS so
// __dirname is available; fileURLToPath/import.meta.url are not needed here.
const SCHEMA_EMIT_PATH = path.resolve(
  __dirname,
  '../../../../packages/graphql-schema/schema.graphql',
);

export function graphqlConfigFactory(): Omit<ApolloDriverConfig, 'driver'> {
  const isProd = process.env.NODE_ENV === 'production';

  return {
    autoSchemaFile: SCHEMA_EMIT_PATH,
    sortSchema: true,
    playground: !isProd,
    introspection: !isProd,
    csrfPrevention: true,
    // CLAUDE.md §3 limits (MM-064). Depth guards nested-relation abuse (safe as a
    // static validation rule — it never reads variables). Complexity runs as a
    // plugin (above) so it has the request variables and won't false-reject
    // parameterised queries.
    validationRules: [depthLimit(MAX_QUERY_DEPTH)],
    plugins: [complexityPlugin],
    subscriptions: {
      'graphql-ws': {
        // Build a synthetic `req` object so LocalAuthGuard + @CurrentUser() work for WS.
        // The JWT strategy reads req.headers.authorization; Passport validates it and
        // sets req.user. This mirrors the HTTP request shape that the guard already
        // understands (auth.guard.ts → getRequest → gqlCtx.req).
        onConnect: async (context: { connectionParams?: Record<string, unknown> }) => {
          const auth = context.connectionParams?.['Authorization'];
          const authStr = typeof auth === 'string' ? auth : '';
          return {
            req: {
              headers: { authorization: authStr },
            },
          };
        },
      },
    },
    formatError: (formatted) => {
      // CLAUDE.md §13 — never expose stack traces or internal messages.
      // Real exception filter wired in MM-026 (typed exceptions).
      const { message, locations, path: errPath, extensions } = formatted;
      return {
        message,
        locations,
        path: errPath,
        extensions: {
          code: (extensions?.['code'] as string | undefined) ?? 'INTERNAL_SERVER_ERROR',
        },
      };
    },
  };
}

// Re-export the path so tooling (e.g. codegen) can reference it directly.
export const SCHEMA_PATH = SCHEMA_EMIT_PATH;
