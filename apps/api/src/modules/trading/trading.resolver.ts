// TradingResolver — MM-026 + MM-027 + MM-030 + MM-031.
// Prompt 24 (resolver discipline): thin — guards, @CurrentUser(), one service call, return.
// No business logic. No try/catch — global exception filter handles typed exceptions.
// Prompt 29 (trading-domain-rules): resolver passes raw input to service; no pre-validation here.

import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription , Int } from '@nestjs/graphql';

import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { LocalAuthGuard } from '../auth/auth.guard';

import { PlaceOrderInput } from './dto/place-order.input';
import { TopupBudgetInput } from './dto/topup-budget.input';
import { MonthlyBudgetGql } from './entities/monthly-budget.entity';
import { OrderGql } from './entities/order.entity';
import { PortfolioPerformanceGql } from './entities/portfolio-performance.entity';
import { PortfolioUpdateGql } from './entities/portfolio-update.entity';
import { PortfolioGql } from './entities/portfolio.entity';
import { TradingService } from './trading.service';

@Resolver()
@UseGuards(LocalAuthGuard)
export class TradingResolver {
  constructor(private readonly tradingService: TradingService) {}

  // ── MM-025 ────────────────────────────────────────────────────────────────

  @Query(() => PortfolioPerformanceGql, {
    description:
      "Daily portfolio return vs NIFTY 50 and S&P 500. Returns null portfolioChangePct when the user has no holdings.",
  })
  portfolioPerformance(@CurrentUser() user: AuthUser): Promise<PortfolioPerformanceGql> {
    return this.tradingService.getPortfolioPerformance(user.id);
  }

  // ── MM-030 ────────────────────────────────────────────────────────────────

  @Query(() => PortfolioGql, {
    description:
      'Full portfolio snapshot: holdings with live P&L, active budget, aggregate metrics, and approximate 30-day equity curve.',
  })
  portfolio(@CurrentUser() user: AuthUser): Promise<PortfolioGql> {
    return this.tradingService.getPortfolio(user.id);
  }

  // ── MM-030 history tab ────────────────────────────────────────────────────

  @Query(() => [OrderGql], { description: 'Chronological trade history for the authenticated user, newest first.' })
  orderHistory(
    @CurrentUser() user: AuthUser,
    @Args('limit', { type: () => Int, defaultValue: 50 }) limit: number,
    @Args('cursor', { type: () => String, nullable: true }) cursor?: string,
  ): Promise<OrderGql[]> {
    return this.tradingService.getOrderHistory(user.id, limit, cursor);
  }

  // ── MM-026 ────────────────────────────────────────────────────────────────

  @Mutation(() => OrderGql, {
    description:
      'Place a simulated market order (BUY or SELL). ' +
      'Idempotent: submitting the same clientGeneratedOrderId returns the existing order. ' +
      'Atomic: Order, Holding, and MonthlyBudget update in a single transaction.',
  })
  placeOrder(
    @CurrentUser() user: AuthUser,
    @Args('input') input: PlaceOrderInput,
  ): Promise<OrderGql> {
    return this.tradingService.placeOrder(user.id, input);
  }

  // ── MM-027 ────────────────────────────────────────────────────────────────

  @Mutation(() => MonthlyBudgetGql, {
    description:
      'Add virtual cash to the current month\'s budget. ' +
      'Fails if the top-up would exceed the tier ceiling (budget.amount).',
  })
  topupBudget(
    @CurrentUser() user: AuthUser,
    @Args('input') input: TopupBudgetInput,
  ): Promise<MonthlyBudgetGql> {
    return this.tradingService.topupBudget(user.id, input);
  }

  // ── MM-031 ────────────────────────────────────────────────────────────────

  @Subscription(() => PortfolioUpdateGql, {
    description:
      'Real-time portfolio P&L updates as prices tick (max 1Hz per user). ' +
      'Emits when any held symbol receives a price update. ' +
      'Yields nothing if the user has no holdings.',
    resolve: (payload: { portfolioUpdate: PortfolioUpdateGql }) => payload.portfolioUpdate,
  })
  portfolioUpdate(@CurrentUser() user: AuthUser | null): AsyncGenerator<{ portfolioUpdate: PortfolioUpdateGql }> {
    if (!user) {
      return (async function* () {})();
    }
    return this.tradingService.subscribeToPortfolioUpdates(user.id);
  }
}
