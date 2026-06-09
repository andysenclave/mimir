// GraphQL @ObjectType for AI stock insights.
// Returned by aiInsight(symbol) query — null when unavailable (kill switch, quota, validation fail).

import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AIInsightGql {
  @Field()
  symbol!: string;

  @Field()
  body!: string;

  @Field()
  model!: string;

  @Field()
  promptVersion!: string;

  @Field(() => Float)
  generatedAt!: number; // Unix ms — avoids GraphQL Date serialisation complexity

  /** True when this result came from the on-demand path and used the user's daily quota. */
  @Field()
  fromQuota!: boolean;

  /** Soft-cap warning — true when user has exceeded 5 on-demand calls today. */
  @Field()
  quotaWarning!: boolean;
}
