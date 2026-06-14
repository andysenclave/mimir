// MM-006 — serverHeartbeat subscription (smoke-test for graphql-ws transport).
// Per prompt 25, real subscriptions filter by user/symbol; this one fans out to
// every subscriber as a transport sanity check. Removed when MM-023 lands the
// stockPrice subscription.

import { Inject, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Resolver, Subscription } from '@nestjs/graphql';
import type { PubSub } from 'graphql-subscriptions';

import { PUB_SUB } from '../pubsub/pubsub.module';

const HEARTBEAT_EVENT = 'serverHeartbeat';

@Resolver()
export class HeartbeatResolver implements OnModuleInit, OnModuleDestroy {
  private intervalRef: NodeJS.Timeout | null = null;

  constructor(@Inject(PUB_SUB) private readonly pubSub: PubSub) {}

  onModuleInit(): void {
    // Emit every 5s for the lifetime of the process.
    this.intervalRef = setInterval(() => {
      void this.pubSub.publish(HEARTBEAT_EVENT, {
        [HEARTBEAT_EVENT]: new Date().toISOString(),
      });
    }, 5_000);
  }

  onModuleDestroy(): void {
    if (this.intervalRef) clearInterval(this.intervalRef);
    this.intervalRef = null;
  }

  @Subscription(() => String, {
    description: 'Server-driven heartbeat (MM-006 smoke test). Removed when MM-023 lands.',
    name: HEARTBEAT_EVENT,
    resolve: (payload: { serverHeartbeat: string }) => payload.serverHeartbeat,
  })
  serverHeartbeat(): AsyncIterator<unknown> {
    return this.pubSub.asyncIterator(HEARTBEAT_EVENT);
  }
}
