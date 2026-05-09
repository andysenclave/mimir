// CLAUDE.md §3 — code-first GraphQL with autoSchemaFile, depth + complexity
// limits, graphql-ws subscriptions. Per CLAUDE.md §11 + ADR-0001, subscription
// auth is validated once at WS handshake via connectionParams.

import path from 'node:path';

import type { ApolloDriverConfig } from '@nestjs/apollo';

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
    // CLAUDE.md §3 limits
    // depth + complexity wired below via plugin (added in MM-026)
    subscriptions: {
      'graphql-ws': {
        // Auth validated once at WS handshake — see ADR-0001.
        // The real verifier lands in MM-010 alongside JwtStrategy.
        onConnect: async (context: { connectionParams?: Record<string, unknown> }) => {
          const auth = context.connectionParams?.['Authorization'];
          // For MM-006 scaffold we accept anonymous WS connections so the
          // serverHeartbeat subscription works in playground without a token.
          // From MM-010 onward, missing/invalid Authorization rejects the connection.
          return { auth: typeof auth === 'string' ? auth : null };
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
