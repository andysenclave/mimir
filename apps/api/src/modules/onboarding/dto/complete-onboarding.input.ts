// MM-013 — completeOnboarding GraphQL input.
// Mirrors the cross-app onboardingInputSchema in @mimir/shared so mobile
// validates the same shape it sends.

import { BUDGET_TIERS, CUSTOM_TIER_MAX, CUSTOM_TIER_MIN, type BudgetTierId } from '@mimir/shared';
import { Field, Int, InputType } from '@nestjs/graphql';
import { Equals, IsBoolean, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

const BUDGET_TIER_IDS: BudgetTierId[] = [
  BUDGET_TIERS.TIER_10K.id,
  BUDGET_TIERS.TIER_25K.id,
  BUDGET_TIERS.TIER_50K.id,
  BUDGET_TIERS.TIER_1L.id,
  BUDGET_TIERS.CUSTOM.id,
];

@InputType('CompleteOnboardingInput')
export class CompleteOnboardingInput {
  @Field(() => String, { description: 'TIER_10K | TIER_25K | TIER_50K | TIER_1L | CUSTOM' })
  @IsEnum(BUDGET_TIER_IDS as unknown as object, {
    message: `budgetTierId must be one of ${BUDGET_TIER_IDS.join(', ')}`,
  })
  budgetTierId!: BudgetTierId;

  @Field(() => Int, { nullable: true, description: 'Required when budgetTierId === CUSTOM' })
  @IsOptional()
  @IsInt()
  @Min(CUSTOM_TIER_MIN)
  @Max(CUSTOM_TIER_MAX)
  customAmount?: number;

  @Field(() => Boolean)
  @IsBoolean()
  @Equals(true, { message: 'Age attestation (18+) is required' })
  ageAttested!: true;

  @Field(() => Boolean)
  @IsBoolean()
  @Equals(true, { message: 'Terms of Service must be accepted' })
  termsAccepted!: true;
}
