// MarketModule — MM-021.
// Prompt 10 (how-to-scaffold-a-new-module.md).
// Owns: market data polling, MarketSnapshot persistence, MarketDataProvider abstraction.
// Concrete provider implementations land in MM-022 (NseIndia + Yahoo fallback).
// In Phase 1 dev, MockMarketDataProvider is the stand-in.

import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { PrismaModule } from '../../prisma/prisma.module';

import { MarketService, REDIS_PUBLISHER, type RedisPublisher } from './market.service';
import { MarketDataPollerProcessor, MARKET_DATA_POLL_QUEUE } from './processors/market-data-poller.processor';
import { MarketDataProvider } from './providers/market-data-provider.interface';
import { MockMarketDataProvider } from './providers/mock-market-data.provider';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    BullModule.registerQueue({ name: MARKET_DATA_POLL_QUEUE }),
  ],
  providers: [
    MarketService,
    MarketDataPollerProcessor,
    // Swap MockMarketDataProvider → NseIndiaProvider (with FallbackMarketDataProvider) in MM-022.
    {
      provide: MarketDataProvider,
      useClass: MockMarketDataProvider,
    },
    // Dedicated Redis connection for raw pub/sub publishing (stock tick channels).
    // Separate from BullMQ's connection. Uses require() to avoid the dual-ioredis type clash
    // (bullmq bundles its own copy; @ts-expect-error is unnecessary since we type as RedisPublisher).
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
