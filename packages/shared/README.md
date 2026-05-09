# @mimir/shared

Single source of truth for cross-cutting types, Zod schemas, constants, and pure utilities used by both `@mimir/api` and `@mimir/mobile`.

See `CLAUDE.md` §6 for the full rule set.

## What goes here

- Zod schemas used by both apps (`placeOrderInputSchema`, `onboardingInputSchema`)
- Shared TypeScript types derived from Zod
- Constants (`BUDGET_TIERS`, `BANNED_AI_WORDS`, `MARKET_HOURS_IST`, `NSE_HOLIDAYS_2026`)
- Pure utility functions (`formatINR`, `isMarketOpen`)

## What does NOT go here

- NestJS decorators, modules, services
- React components or hooks
- Prisma types
- Anything with side effects on import

## Import discipline

```ts
// Backend
import { placeOrderInputSchema, type PlaceOrderInput } from '@mimir/shared';

// Mobile
import { formatINR, isMarketOpen } from '@mimir/shared';
```
