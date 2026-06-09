// MM-041 — NotificationPreferences GraphQL entity.

import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NotificationPreferencesGql {
  @Field(() => ID)
  id!: string;

  @Field()
  streakEnabled!: boolean;

  @Field()
  budgetEnabled!: boolean;

  @Field()
  priceAlertsEnabled!: boolean;

  @Field()
  portfolioEvtEnabled!: boolean;

  @Field()
  educationalEnabled!: boolean;

  /** Quiet hours start — HH:MM 24h IST. Default "22:00". */
  @Field()
  quietHoursStart!: string;

  /** Quiet hours end — HH:MM 24h IST. Default "07:00". */
  @Field()
  quietHoursEnd!: string;

  /** Daily non-transactional push cap. Default 2, max 3. */
  @Field(() => Int)
  dailyCap!: number;
}
