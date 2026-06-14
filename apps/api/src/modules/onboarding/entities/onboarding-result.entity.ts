// MM-013 — completeOnboarding result. Returns the updated user + a slim
// budget summary so the mobile AuthProvider can hydrate state without an
// extra round-trip to /auth/me.

import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

import { AuthUser } from '../../../me/entities/auth-user.entity';

@ObjectType('OnboardingBudgetSummary')
export class OnboardingBudgetSummary {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { description: 'TIER_10K | TIER_25K | TIER_50K | TIER_1L | CUSTOM' })
  tier!: string;

  @Field(() => Int, { description: 'Allocated cash in INR (Decimal serialized as paise/INR int)' })
  amount!: number;

  @Field(() => String, { description: 'ISO date — start of the active cycle' })
  cycleStart!: string;

  @Field(() => String, { description: 'ISO date — end of the active cycle' })
  cycleEnd!: string;
}

@ObjectType('OnboardingResult')
export class OnboardingResult {
  @Field(() => AuthUser)
  user!: AuthUser;

  @Field(() => OnboardingBudgetSummary)
  budget!: OnboardingBudgetSummary;
}
