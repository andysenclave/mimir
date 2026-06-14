// MM-023 — GraphQL market queries + subscriptions.
// Prompt 24 (resolver discipline): thin, one service call per field.
// Prompt 25 (subscription discipline): filter by symbol, resolve from payload.

import { Inject, UseGuards } from '@nestjs/common';
import { Args, Query, Resolver, Subscription } from '@nestjs/graphql';


import { PUB_SUB } from '../../pubsub/pubsub.module';
import { LocalAuthGuard } from '../auth/auth.guard';

import { IntradayPointGql } from './entities/intraday-point.entity';
import { MarketOverviewGql } from './entities/market-overview.entity';
import { StockPriceUpdate } from './entities/stock-price-update.entity';
import { StockQuoteGql } from './entities/stock-quote.entity';
import { STOCK_TICK_CHANNEL , MarketService } from './market.service';

import type { RedisPubSub } from 'graphql-redis-subscriptions';

@Resolver()
@UseGuards(LocalAuthGuard)
export class MarketResolver {
  constructor(
    private readonly marketService: MarketService,
    @Inject(PUB_SUB) private readonly pubSub: RedisPubSub,
  ) {}

  @Query(() => MarketOverviewGql, { description: 'Current market overview: indices, sectors, top movers.' })
  marketOverview(): Promise<MarketOverviewGql> {
    return this.marketService.getMarketOverview();
  }

  @Query(() => StockQuoteGql, { nullable: true, description: 'Last-known snapshot for a single NSE symbol.' })
  stock(@Args('symbol') symbol: string): Promise<StockQuoteGql | null> {
    return this.marketService.getStockQuote(symbol);
  }

  @Query(() => [StockQuoteGql], {
    description: 'Search the tradeable NSE universe by symbol substring (max 20 results).',
  })
  searchStocks(@Args('query') query: string): Promise<StockQuoteGql[]> {
    return this.marketService.searchStocks(query);
  }

  @Query(() => [IntradayPointGql], { description: 'Intraday price series for a symbol (1-day, ~5-min intervals). Returns [] when market is closed.' })
  stockIntraday(@Args('symbol') symbol: string): Promise<IntradayPointGql[]> {
    return this.marketService.getStockIntraday(symbol);
  }

  @Subscription(() => StockPriceUpdate, {
    description: 'Live LTP ticks for the requested symbols (15s cadence during market hours).',
    filter: (payload: { stockPrice: StockPriceUpdate }, variables: { symbols: string[] }) =>
      variables.symbols.includes(payload.stockPrice.symbol),
    resolve: (payload: { stockPrice: StockPriceUpdate }) => payload.stockPrice,
  })
  stockPrice(
    @Args({ name: 'symbols', type: () => [String] }) _symbols: string[],
  ): AsyncIterableIterator<unknown> {
    return this.pubSub.asyncIterableIterator(STOCK_TICK_CHANNEL);
  }
}
