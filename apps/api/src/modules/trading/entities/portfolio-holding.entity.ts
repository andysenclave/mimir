// PortfolioHoldingGql — MM-030/031.
// Single holding with live P&L metrics (LTP from market provider).

import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('PortfolioHolding', { description: 'A stock holding with live P&L metrics.' })
export class PortfolioHoldingGql {
  @Field(() => String)
  symbol!: string;

  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => Int)
  quantity!: number;

  @Field(() => Float, { description: 'Volume-weighted average buy price.' })
  avgBuyPrice!: number;

  @Field(() => Float, { description: 'Last traded price.' })
  ltp!: number;

  @Field(() => Float, { description: 'Unrealized P&L in INR.' })
  unrealizedPnl!: number;

  @Field(() => Float, { description: 'Unrealized P&L as % of invested.' })
  unrealizedPnlPct!: number;

  @Field(() => Float, { description: 'Current market value = quantity × LTP.' })
  totalValue!: number;
}
