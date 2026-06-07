// MM-025 — TradingResolver (stub).
// Prompt 24 (resolver discipline): thin — guards, @CurrentUser(), one service call, return.
// Full resolver (placeOrder, portfolio, tradeHistory) lands in MM-026+.

import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { LocalAuthGuard } from '../auth/auth.guard';

import { PortfolioPerformanceGql } from './entities/portfolio-performance.entity';
import { TradingService } from './trading.service';

@Resolver()
@UseGuards(LocalAuthGuard)
export class TradingResolver {
  constructor(private readonly tradingService: TradingService) {}

  @Query(() => PortfolioPerformanceGql, {
    description:
      "Daily portfolio return vs NIFTY 50 and S&P 500. Returns null portfolioChangePct when the user has no holdings.",
  })
  portfolioPerformance(@CurrentUser() user: AuthUser): Promise<PortfolioPerformanceGql> {
    return this.tradingService.getPortfolioPerformance(user.id);
  }
}
