// MM-007 — GraphQL Codegen config.
// Reads the SDL emitted by @mimir/api into packages/graphql-schema/schema.graphql.
// Produces typed Apollo hooks consumed by features/* and hooks/*.

import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: '../../packages/graphql-schema/schema.graphql',
  documents: ['graphql/**/*.graphql', 'features/**/*.graphql'],
  generates: {
    'graphql/generated.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
        withComponent: false,
        withHOC: false,
        // CLAUDE.md §5 — no enums
        enumsAsTypes: true,
        avoidOptionals: { field: true, inputValue: false, object: false },
        // Standard scalar mappings
        scalars: {
          DateTime: 'string',
          Decimal: 'string',
          JSON: 'unknown',
        },
        // CLAUDE.md §13 — Apollo error policies handled in errorLink
        defaultBaseOptions: { errorPolicy: 'all' },
        skipTypename: false,
      },
    },
  },
  hooks: {
    afterAllFileWrite: ['prettier --write'],
  },
};

export default config;
