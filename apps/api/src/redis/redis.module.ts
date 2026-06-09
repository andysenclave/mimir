// Shared Redis client module — provides a single ioredis connection for
// non-pubsub use: cache reads/writes, quota counters, rate limiting.
//
// PubSubModule manages its own pair of connections (publisher + subscriber)
// for graphql-redis-subscriptions — those are separate from this client.
// BullMQ also manages its own ioredis connections via @nestjs/bullmq global config.
// This module is the third ioredis connection, kept intentionally separate so
// a brief Redis blip in pubsub doesn't affect cache/quota and vice versa.

import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (config: ConfigService): Redis => {
        const url = config.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
        return new Redis(url, { maxRetriesPerRequest: null, lazyConnect: true });
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
