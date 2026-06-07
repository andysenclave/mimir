// TradingResolver — MM-026 + MM-027.
// Prompt 24 (resolver discipline): thin — guards, @CurrentUser(), one service call, return.
// No business logic. No try/catch — global exception filter handles typed exceptions.
// Prompt 29 (trading-domain-rules): resolver passes raw input to service; no pre-validation here.

import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { LocalAuthGuard } from '../auth/auth.guard';

import { PlaceOrderInput } from './dto/place-order.input';
import { TopupBudgetInput } from './dto/topup-budget.input';
import { MonthlyBudgetGql } from './entities/monthly-budget.entity';
import { OrderGql } from './entities/order.entity';
import { PortfolioPerformanceGql } from './entities/portfolio-performance.entity';
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
}
