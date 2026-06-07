// PortfolioUpdateGql — MM-031.
// Subscription payload: real-time portfolio P&L snapshot emitted on price ticks.

import { Field, Float, ObjectType } from '@nestjs/graphql';

import { PortfolioHoldingGql } from './portfolio-holding.entity';

@ObjectType('PortfolioUpdate', { description: 'Real-time portfolio P&L snapshot (1Hz max).' })
export class PortfolioUpdateGql {
  @Field(() => Float)
  totalValue!: number;

  @Field(() => Float)
  totalInvested!: number;

  @Field(() => Float)
  totalPnl!: number;

  @Field(() => Float)
  totalPnlPct!: number;

  @Field(() => Float, { description: 'Cash remaining in the active budget.' })
  cashRemaining!: number;

  @Field(() => [PortfolioHoldingGql], { description: 'Updated per-holding metrics.' })
  holdings!: PortfolioHoldingGql[];
}
