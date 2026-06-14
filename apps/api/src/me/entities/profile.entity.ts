// MM-036 — Profile screen entity.
// Returned by `profile` query. Aggregates user identity + budget + stats + watchlist.

import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WatchlistItemGql {
  @Field(() => ID)
  symbol!: string;

  @Field({ nullable: true })
  ltp?: number;

  @Field({ nullable: true })
  changePct?: number;

  @Field()
  alertEnabled!: boolean;
}

@ObjectType()
export class ProfileStatsGql {
  /** Total portfolio return since signup, in INR (unrealizedPnl + realizedPnl sum). */
  @Field(() => Float)
  totalReturnInr!: number;

  /** Percentage return relative to total invested. */
  @Field(() => Float)
  totalReturnPct!: number;

  /** Budget tier label e.g. "₹50K". */
  @Field()
  budgetTierLabel!: string;

  /** Active budget tier id e.g. "TIER_50K" — drives the Trading Preferences selection. */
  @Field()
  budgetTierId!: string;

  /** Desired tier for next cycle (MM-058), if the user changed it; null otherwise. */
  @Field(() => String, { nullable: true })
  preferredTierId?: string | null;

  /** Remaining cash in the current monthly budget. */
  @Field(() => Float)
  cashRemaining!: number;

  /** Phase 2 placeholder — always 0 in Phase 1. */
  @Field()
  coursesDone!: number;

  /** Phase 2 placeholder — always 0 in Phase 1. */
  @Field()
  quizScore!: number;
}

@ObjectType()
export class UserProfileGql {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field({ nullable: true })
  displayName?: string;

  /** Unix ms timestamp — client formats as "Member since {month} {year}". */
  @Field(() => Float)
  memberSince!: number;

  @Field(() => ProfileStatsGql)
  stats!: ProfileStatsGql;

  @Field(() => [WatchlistItemGql])
  watchlist!: WatchlistItemGql[];
}
