# @mimir/graphql-schema

The generated GraphQL SDL surface that mobile codegen reads from.

## Source of truth

- The schema is **code-first** in `apps/api`.
- On every backend build, `@nestjs/graphql` writes `schema.graphql` here.
- `@mimir/mobile` codegen reads `schema.graphql` and produces typed hooks.
- **Never edit `schema.graphql` by hand.** Edits are reverted on next build.

See `CLAUDE.md` §3 for the full rules.
