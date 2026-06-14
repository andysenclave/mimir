// In-memory PubSub for MM-006 (serverHeartbeat subscription) — replaced by
// graphql-redis-subscriptions in MM-021 / MM-023 once Redis is the source of truth
// for market data ticks.

import { Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

export const PUB_SUB = 'PUB_SUB';

@Module({
  providers: [
    {
      provide: PUB_SUB,
      useValue: new PubSub(),
    },
  ],
  exports: [PUB_SUB],
})
export class PubSubModule {}
