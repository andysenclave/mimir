// MM-006 — `me` query.
// Returns hardcoded user for the MM-006 smoke test. Wired to real auth context
// (@CurrentUser) in MM-010 once JwtStrategy + LocalAuthGuard land.
//
// Per prompt 24: resolvers are thin; no business logic; return @ObjectType.

import { Query, Resolver } from '@nestjs/graphql';

import { AuthUser } from './entities/auth-user.entity';

@Resolver(() => AuthUser)
export class MeResolver {
  @Query(() => AuthUser, {
    description: 'Authenticated user. MM-006 returns a hardcoded stub; MM-010 wires real auth.',
  })
  me(): AuthUser {
    return {
      id: 'user_dev_placeholder',
      email: 'andy@mimir.local',
      displayName: 'Andy (dev)',
      onboardingDone: true,
    };
  }
}
