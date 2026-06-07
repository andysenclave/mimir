// EquityPointGql — MM-030.
// One data point on the 30-day portfolio equity curve.

import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType('EquityPoint')
export class EquityPointGql {
  @Field(() => String, { description: 'ISO date string (YYYY-MM-DD).' })
  date!: string;

  @Field(() => Float, { description: 'Portfolio value in INR at that date.' })
  value!: number;
}
