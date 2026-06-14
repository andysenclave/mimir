// MM-010 — LocalAuthGuard.
// Same shape as the eventual @HeimdalGuard so the Sprint 2 swap is a one-liner
// (CLAUDE.md §11, ADR-0001 §1). Honours @Public() opt-out.

import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

@Injectable()
export class LocalAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(ctx: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(ctx);
  }

  override getRequest(ctx: ExecutionContext): unknown {
    if (ctx.getType<'http' | 'graphql' | 'rpc' | 'ws'>() === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(ctx).getContext<{ req: unknown }>();
      return gqlCtx.req;
    }
    return ctx.switchToHttp().getRequest();
  }
}
