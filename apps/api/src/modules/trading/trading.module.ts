// TradingModule — MM-026 + MM-027.
// Adds: ioredis provider for rate limiting, BullMQ budget-rollover queue + processor,
//       PlaceOrderInput DTO, OrderGql / MonthlyBudgetGql entities, full service methods.

import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { PrismaModule } from '../../prisma/prisma.module';
import { MarketModule } from '../market/market.module';

import { BudgetRolloverProcessor, BUDGET_ROLLOVER_QUEUE } from './processors/budget-rollover.processor';
import { TradingResolver } from './trading.resolver';
import { TradingService, TRADING_REDIS } from './trading.service';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    MarketModule,
    // Register the budget-rollover queue. BullMQ.forRootAsync in AppModule provides
    // the global Redis connection; registerQueue just registers the queue name.
    BullModule.registerQueue({ name: BUDGET_ROLLOVER_QUEUE }),
  ],
  providers: [
    // ── ioredis client for rate limiting ──────────────────────────────────────
    // Separate from BullMQ's bundled ioredis so we can use pipeline() directly.
    // CLAUDE.md §17: Redis URL from ConfigService (validated at boot via Zod).
    {
      provide: TRADING_REDIS,
      useFactory: (config: ConfigService): Redis => {
        const redisUrl = config.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
        const parsed = new URL(redisUrl);
        return new Redis({
          host: parsed.hostname,
          port: parseInt(parsed.port || '6379', 10),
          password: parsed.password || undefined,
          // Fail fast — don't block the app from starting if Redis is down.
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });
      },
      inject: [ConfigService],
    },
    TradingService,
    TradingResolver,
    BudgetRolloverProcessor,
  ],
  exports: [TradingService],
})
export class TradingModule {}
