// CLAUDE.md §11 — `@CurrentUser()` injects the authenticated principal into
// resolvers and controllers. Mirrors the eventual Heimdal SDK shape so the swap
// in Sprint 2 (MM-S2-AUTH-SWAP) is a no-op for callers.

import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export type AuthUser = {
  id: string;
  email: string;
};

export const CurrentUser = createParamDecorator<unknown, AuthUser | null>(
  (_data, ctx: ExecutionContext): AuthUser | null => {
    const isGql = ctx.getType<'http' | 'graphql' | 'rpc' | 'ws'>() === 'graphql';
    const req = isGql
      ? (GqlExecutionContext.create(ctx).getContext() as { req?: { user?: AuthUser } })?.req
      : (ctx.switchToHttp().getRequest() as { user?: AuthUser });
    return req?.user ?? null;
  },
);
