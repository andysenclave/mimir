// MarketModule — MM-021/MM-022/MM-023.
// MM-023: PubSubModule imported (RedisPubSub), REDIS_PUBLISHER removed,
//         MarketResolver added for GraphQL queries + stockPrice subscription.

import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from '../../prisma/prisma.module';
import { PubSubModule } from '../../pubsub/pubsub.module';

import { MarketResolver } from './market.resolver';
import { MarketService } from './market.service';
import { MarketDataPollerProcessor, MARKET_DATA_POLL_QUEUE } from './processors/market-data-poller.processor';
import { FallbackMarketDataProvider } from './providers/fallback-market-data.provider';
import { MarketDataProvider } from './providers/market-data-provider.interface';
import { NseIndiaProvider } from './providers/nse-india.provider';
import { YahooFinanceProvider } from './providers/yahoo-finance.provider';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    PubSubModule,
    BullModule.registerQueue({ name: MARKET_DATA_POLL_QUEUE }),
  ],
  providers: [
    MarketService,
    MarketResolver,
    MarketDataPollerProcessor,
    NseIndiaProvider,
    YahooFinanceProvider,
    {
      provide: MarketDataProvider,
      useClass: FallbackMarketDataProvider,
    },
  ],
  exports: [MarketService, MarketDataProvider],
})
export class MarketModule {}
