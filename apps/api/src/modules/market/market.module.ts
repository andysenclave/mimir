// MarketModule — MM-021/MM-022.
// Prompt 10 (how-to-scaffold-a-new-module.md).
// Owns: market data polling, MarketSnapshot persistence, MarketDataProvider abstraction.
// MM-022: FallbackMarketDataProvider (NseIndia primary + Yahoo fallback) wired as the provider.

import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PrismaModule } from '../../prisma/prisma.module';

import { MarketService, REDIS_PUBLISHER, type RedisPublisher } from './market.service';
import { MarketDataPollerProcessor, MARKET_DATA_POLL_QUEUE } from './processors/market-data-poller.processor';
import { FallbackMarketDataProvider } from './providers/fallback-market-data.provider';
import { MarketDataProvider } from './providers/market-data-provider.interface';
import { NseIndiaProvider } from './providers/nse-india.provider';
import { YahooFinanceProvider } from './providers/yahoo-finance.provider';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    BullModule.registerQueue({ name: MARKET_DATA_POLL_QUEUE }),
  ],
  providers: [
    MarketService,
    MarketDataPollerProcessor,
    // MM-022: real providers. NseIndiaProvider is primary, YahooFinanceProvider is fallback.
    // FallbackMarketDataProvider wraps both with a circuit breaker.
    NseIndiaProvider,
    YahooFinanceProvider,
    {
      provide: MarketDataProvider,
      useClass: FallbackMarketDataProvider,
    },
    // Dedicated Redis connection for raw pub/sub publishing (stock tick channels).
    // Separate from BullMQ's connection. Uses require() to avoid dual-ioredis type clash.
    {
      provide: REDIS_PUBLISHER,
      useFactory: (config: ConfigService): RedisPublisher => {
        const url = config.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const IORedis = require('ioredis');
        return new IORedis(url, { maxRetriesPerRequest: null, lazyConnect: true }) as RedisPublisher;
      },
      inject: [ConfigService],
    },
  ],
  exports: [MarketService, MarketDataProvider],
})
export class MarketModule {}
