// MM-040 — Price-alert worker.
// Subscribes to the STOCK_TICK_CHANNEL Redis pub/sub (published by MarketService on every poll).
// For each tick: finds watchlist rows with alertEnabled=true for that symbol,
// checks if price has moved ±3% from yesterday's close (MarketSnapshot.close),
// and dispatches via NotificationDispatchService.
// Debounce: one alert per user+symbol per hour (Redis key).
//
// NOTE: This worker uses ioredis subscribe (not BullMQ) because it listens to a
// pub/sub channel rather than processing jobs. It is registered as a NestJS
// OnApplicationBootstrap lifecycle hook so it starts after the app is ready.

import { Inject, Injectable, Logger, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { NotificationCategory } from '@prisma/client';


import { STOCK_TICK_CHANNEL } from '../modules/market/market.service';
import { NotificationDispatchService } from '../modules/notifications/notification-dispatch.service';
import { priceAlertTemplate } from '../modules/notifications/templates/price-alert';
import { PrismaService } from '../prisma/prisma.service';
import { REDIS_CLIENT } from '../redis/redis.module';

import type { Redis } from 'ioredis';

const ALERT_THROTTLE_TTL_SEC = 3600; // 1 hour
const ALERT_THRESHOLD_PCT = 3.0;     // ±3% from previous close

@Injectable()
export class PriceAlertsProcessor implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(PriceAlertsProcessor.name);
  // A dedicated subscriber connection (must not share with the publisher).
  private subscriber: Redis | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly dispatch: NotificationDispatchService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  onApplicationBootstrap(): void {
    // Clone the existing Redis connection as a subscriber.
    this.subscriber = this.redis.duplicate();
    this.subscriber.subscribe(STOCK_TICK_CHANNEL, (err) => {
      if (err) {
        this.logger.error('Failed to subscribe to STOCK_TICK_CHANNEL', err);
      }
    });

    this.subscriber.on('message', (_channel: string, message: string) => {
      void this.handleTick(message);
    });

    this.logger.log('Subscribed to STOCK_TICK_CHANNEL for price alerts');
  }

  async onApplicationShutdown(): Promise<void> {
    await this.subscriber?.quit();
  }

  private async handleTick(raw: string): Promise<void> {
    let tick: { symbol: string; ltp: number } | null = null;
    try {
      tick = JSON.parse(raw) as { symbol: string; ltp: number };
    } catch {
      return;
    }

    const { symbol, ltp } = tick;

    // Get yesterday's close from MarketSnapshot.
    const snapshot = await this.prisma.marketSnapshot.findUnique({
      where: { symbol },
      select: { close: true },
    });
    if (!snapshot?.close) return;

    const close = snapshot.close.toNumber();
    if (close === 0) return;
    const changePct = ((ltp - close) / close) * 100;
    if (Math.abs(changePct) < ALERT_THRESHOLD_PCT) return;

    // Find watchlist subscribers for this symbol.
    const watchers = await this.prisma.watchlist.findMany({
      where: { symbol, alertEnabled: true },
      select: { userId: true },
    });
    if (watchers.length === 0) return;

    const direction = changePct > 0 ? 'up' : 'down';

    for (const { userId } of watchers) {
      // Debounce: skip if we already alerted this user for this symbol within the hour.
      const debounceKey = `price-alert:${userId}:${symbol}`;
      const alreadySent = await this.redis.get(debounceKey);
      if (alreadySent) continue;

      await this.redis.set(debounceKey, '1', 'EX', ALERT_THROTTLE_TTL_SEC);

      const payload = priceAlertTemplate({ symbol, direction, changePct });
      await this.dispatch.dispatch(userId, NotificationCategory.PRICE_ALERT, payload);
    }
  }
}
