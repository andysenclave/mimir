// IntradayPointGql — single price point in an intraday chart series.
// timestamp: Unix milliseconds. price: absolute INR value.

import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType('IntradayPoint')
export class IntradayPointGql {
  @Field(() => Float, { description: 'Unix timestamp in milliseconds.' })
  timestamp!: number;

  @Field(() => Float, { description: 'Price in INR at this point.' })
  price!: number;
}
