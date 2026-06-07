// MonthlyBudgetGql — GraphQL @ObjectType for a user's monthly virtual budget (MM-027).
// Returned by topupBudget mutation so mobile can update the displayed cash balance.

import { Field, Float, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('MonthlyBudget', { description: 'A user\'s virtual budget for the current cycle.' })
export class MonthlyBudgetGql {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { description: 'Budget tier: TIER_10K | TIER_25K | TIER_50K | TIER_1L | CUSTOM.' })
  tier!: string;

  @Field(() => Float, { description: 'Initial budget amount for this cycle (INR).' })
  amount!: number;

  @Field(() => Float, { description: 'Remaining spendable cash (INR). Decrements on BUY, increments on SELL.' })
  cashRemaining!: number;

  @Field(() => String, { description: 'ACTIVE | EXPIRED.' })
  status!: string;

  @Field(() => GraphQLISODateTime, { description: 'Start of the monthly cycle.' })
  cycleStart!: Date;

  @Field(() => GraphQLISODateTime, { description: 'End of the monthly cycle (exclusive).' })
  cycleEnd!: Date;
}
