<!-- Mimir PR template — see CLAUDE.md §16 -->

## Summary

<!-- 1–3 sentences. What does this PR do, in plain language? -->

## Story

Refs: MM-XXX

## Changes

<!-- Bullet list. Files / modules touched at a high level. -->

-

## Testing

<!-- How did you verify? Unit tests added? Manual on Andy's iPhone? Staging deploy? -->

-

## Risk

<!-- What could go wrong, and how do we roll back? Reference any locked decisions in MIMIR-Execution-Plan-v2 §3 or ADRs that constrain the approach. -->

-

## Checklist

- [ ] Branch named `feature/MM-XXX-...`, `fix/MM-XXX-...`, or `chore/...`
- [ ] Conventional commits with valid scope (mobile/api/shared/graphql/ai/notifications/trading/market/learning/auth/infra/ci/deps/release/monorepo)
- [ ] CI green (lint, typecheck, tests, build, codegen drift)
- [ ] Story acceptance criteria met (paste from STORIES.md if helpful)
- [ ] No tokens, secrets, or PII added to logs / Sentry / PostHog events
- [ ] If schema changed: codegen run, mobile + api both compile
- [ ] If a locked decision changed: ADR added in `docs/adr/` and `MIMIR-Execution-Plan-v2.md` version bumped
