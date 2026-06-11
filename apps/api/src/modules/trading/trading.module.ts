// TradingModule — MM-026 + MM-027.
// Adds: ioredis provider for rate limiting, BullMQ budget-rollover queue + processor,
//       PlaceOrderInput DTO, OrderGql / MonthlyBudgetGql entities, full service methods.

import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { ORDER_FILL_QUEUE } from '../../jobs/order-fill-notification.processor';
import { PrismaModule } from '../../prisma/prisma.module';
import { PubSubModule, PUB_SUB } from '../../pubsub/pubsub.module';
import { MarketModule } from '../market/market.module';

import { BudgetRolloverProcessor, BUDGET_ROLLOVER_QUEUE } from './processors/budget-rollover.processor';
import { TradingResolver } from './trading.resolver';
import { TradingService, TRADING_REDIS, TRADING_PUB_SUB } from './trading.service';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    PubSubModule,
    MarketModule,
    BullModule.registerQueue({ name: BUDGET_ROLLOVER_QUEUE }),
    BullModule.registerQueue({ name: ORDER_FILL_QUEUE }),
  ],
  providers: [
    // ── PubSub alias (the shared PUB_SUB token re-exported under TRADING_PUB_SUB
    //    so TradingService doesn't need to depend on the PUB_SUB string literal).
    { provide: TRADING_PUB_SUB, useExisting: PUB_SUB },

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
