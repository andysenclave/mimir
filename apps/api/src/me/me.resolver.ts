// MM-013 — `me` query now reads from real auth context (@CurrentUser) and
// hydrates from Prisma. Replaces the MM-006 hardcoded stub.
// MM-036 — adds `profile` query for the Profile tab.
// Per prompt 24: thin resolver, single service call, returns @ObjectType.

import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import {
  CurrentUser,
  type AuthUser as AuthUserContext,
} from '../common/decorators/current-user.decorator';
import { LocalAuthGuard } from '../modules/auth/auth.guard';

import { AuthUser } from './entities/auth-user.entity';
import { UserProfileGql } from './entities/profile.entity';
import { MeService } from './me.service';

@Resolver(() => AuthUser)
@UseGuards(LocalAuthGuard)
export class MeResolver {
  constructor(private readonly meService: MeService) {}

  @Query(() => AuthUser, {
    description: 'The currently authenticated user. Requires a valid JWT.',
  })
  me(@CurrentUser() user: AuthUserContext | null): Promise<AuthUser> {
    if (user === null) {
      throw new Error('User context missing despite LocalAuthGuard');
    }
    return this.meService.getMe(user.id);
  }

  @Query(() => UserProfileGql, {
    description:
      'Aggregated profile data for the Profile tab: identity, stats, top-3 watchlist. ' +
      'Watchlist LTP is populated from MarketSnapshot; no live prices here — ' +
      'mobile subscribes to stockPrice subscription for live ticks.',
  })
  profile(@CurrentUser() user: AuthUserContext | null): Promise<UserProfileGql> {
    if (user === null) {
      throw new Error('User context missing despite LocalAuthGuard');
    }
    return this.meService.getProfile(user.id);
  }
}
