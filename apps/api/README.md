# @mimir/api

NestJS 11 backend for Mimir.

See `CLAUDE.md` §2 (backend module architecture), §3 (GraphQL conventions added in MM-006), §7 (Prisma conventions), §17 (env validation).

## Development

```bash
# from repo root
docker-compose up -d                    # local Postgres + Redis
cp apps/api/.env.example apps/api/.env.local
pnpm --filter api prisma:generate
pnpm --filter api prisma:migrate:dev    # applies any pending migrations
pnpm --filter api dev                   # starts NestJS at :3000
curl localhost:3000/health              # → { status, db, redis, ... }
```

## Stack

- NestJS 11
- Prisma 6 + PostgreSQL 16 (Neon ap-south-1 Mumbai in prod)
- Apollo Server (added in MM-006)
- Redis 7 (Upstash) for caching + BullMQ (added in MM-021)
- Heimdal SDK / ADR-0001 fallback for auth (MM-010)
- Anthropic Haiku for AI insights (MM-032)

## Layout

```
apps/api/
├── prisma/
│   ├── schema.prisma           # Phase 1 entities added in MM-008
│   ├── seed.ts                 # Test user + budget (MM-008)
│   └── migrations/             # Created by prisma migrate dev
├── src/
│   ├── main.ts                 # Bootstrap (validation pipe, shutdown hooks)
│   ├── app.module.ts           # Root module composition
│   ├── config/
│   │   └── env.schema.ts       # Zod env validation
│   ├── prisma/
│   │   ├── prisma.module.ts    # Global module
│   │   └── prisma.service.ts
│   ├── health/                 # MM-003 — /health endpoint
│   └── modules/                # Feature modules added from MM-006 onward
└── test/                       # Integration / e2e tests (MM-009 prompt)
```
