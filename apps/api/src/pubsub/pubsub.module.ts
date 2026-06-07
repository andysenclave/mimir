// MM-023: upgraded from in-memory PubSub to Redis-backed RedisPubSub.
// RedisPubSub uses two separate ioredis connections (publisher + subscriber)
// so it works correctly across processes and survives Redis reconnects.

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

export const PUB_SUB = 'PUB_SUB';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PUB_SUB,
      useFactory: (config: ConfigService): RedisPubSub => {
        const url = config.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
        const makeRedis = () =>
          new Redis(url, { maxRetriesPerRequest: null, lazyConnect: true });
        return new RedisPubSub({ publisher: makeRedis(), subscriber: makeRedis() });
      },
      inject: [ConfigService],
    },
  ],
  exports: [PUB_SUB],
})
export class PubSubModule {}
