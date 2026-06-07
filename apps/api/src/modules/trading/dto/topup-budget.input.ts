// TopupBudgetInput — adds virtual cash to the current month's budget.
// Prompt 07 (how-to-design-a-dto): simple Float input; backend enforces tier ceiling.

import { CUSTOM_TIER_MAX } from '@mimir/shared';
import { Field, Float, InputType } from '@nestjs/graphql';
import { IsNumber, IsPositive, Max } from 'class-validator';


@InputType({ description: 'Add virtual cash to the current month\'s budget.' })
export class TopupBudgetInput {
  @Field(() => Float, { description: 'Amount in INR to add. Must be positive and within tier headroom.' })
  @IsNumber()
  @IsPositive()
  @Max(CUSTOM_TIER_MAX)
  amount!: number;
}
