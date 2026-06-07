// PortfolioGql — MM-030.
// Full portfolio snapshot: holdings, budget, aggregate metrics, equity curve.

import { Field, Float, ObjectType } from '@nestjs/graphql';

import { MonthlyBudgetGql } from './monthly-budget.entity';
import { EquityPointGql } from './equity-point.entity';
import { PortfolioHoldingGql } from './portfolio-holding.entity';

@ObjectType('Portfolio', { description: 'Full portfolio snapshot for the Portfolio screen.' })
export class PortfolioGql {
  @Field(() => [PortfolioHoldingGql])
  holdings!: PortfolioHoldingGql[];

  @Field(() => MonthlyBudgetGql, { description: 'Active monthly budget.' })
  budget!: MonthlyBudgetGql;

  @Field(() => Float, { description: 'Total market value of all holdings.' })
  totalValue!: number;

  @Field(() => Float, { description: 'Total cost basis (avgBuyPrice × qty) across all holdings.' })
  totalInvested!: number;

  @Field(() => Float, { description: 'Aggregate unrealized P&L in INR.' })
  totalPnl!: number;

  @Field(() => Float, { description: 'Aggregate unrealized P&L as % of totalInvested.' })
  totalPnlPct!: number;

  @Field(() => [EquityPointGql], {
    description:
      'Approximate 30-day equity curve. Values use current LTP (not historical prices) as a proxy.',
  })
  equityCurve!: EquityPointGql[];
}
