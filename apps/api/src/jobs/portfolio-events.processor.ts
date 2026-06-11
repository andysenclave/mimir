// MM-040 — Portfolio-events BullMQ worker.
// Cron: 15:30 IST on weekdays (30 min after market close).
// Per user with holdings: compute daily P&L % vs previous close from MarketSnapshot.
// If abs(dailyPnlPct) >= 5.0 → dispatch PORTFOLIO_EVENT push.
// Batches users in groups of 500.

import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { NotificationCategory } from '@prisma/client';


import { NotificationDispatchService } from '../modules/notifications/notification-dispatch.service';
import { portfolioEventTemplate } from '../modules/notifications/templates/portfolio-event';
import { PrismaService } from '../prisma/prisma.service';

import type { Job } from 'bullmq';

export const PORTFOLIO_EVENTS_QUEUE = 'portfolio-events';
export const PORTFOLIO_EVENTS_JOB = 'run-portfolio-events';

const EOD_PNL_THRESHOLD_PCT = 5.0;
const BATCH_SIZE = 500;

@Processor(PORTFOLIO_EVENTS_QUEUE, { concurrency: 1 })
export class PortfolioEventsProcessor extends WorkerHost {
  private readonly logger = new Logger(PortfolioEventsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dispatch: NotificationDispatchService,
  ) {
    super();
  }

  async process(_job: Job): Promise<void> {
    let cursor: string | undefined;
    let dispatched = 0;

    do {
      // Fetch distinct users who have holdings.
      const holdingGroups = await this.prisma.holding.groupBy({
        by: ['userId'],
        ...(cursor ? { where: { userId: { gt: cursor } } } : {}),
        orderBy: { userId: 'asc' },
        take: BATCH_SIZE,
      });

      for (const { userId } of holdingGroups) {
        const dailyPnlPct = await this.computeDailyPnlPct(userId);
        if (dailyPnlPct === null) continue;
        if (Math.abs(dailyPnlPct) < EOD_PNL_THRESHOLD_PCT) continue;

        const payload = portfolioEventTemplate({ dailyPnlPct });
        await this.dispatch.dispatch(userId, NotificationCategory.PORTFOLIO_EVENT, payload);
        dispatched++;
      }

      cursor =
        holdingGroups.length === BATCH_SIZE
          ? holdingGroups[holdingGroups.length - 1]?.userId
          : undefined;
    } while (cursor !== undefined);

    this.logger.log(`portfolio-events: dispatched ${dispatched} notifications`);
  }

  /** Computes daily P&L % for a user's portfolio using MarketSnapshot. Returns null if no snapshot data. */
  private async computeDailyPnlPct(userId: string): Promise<number | null> {
    const holdings = await this.prisma.holding.findMany({
      where: { userId },
      select: { symbol: true, quantity: true, avgBuyPrice: true },
    });
    if (holdings.length === 0) return null;

    const symbols = holdings.map((h) => h.symbol);
    const snapshots = await this.prisma.marketSnapshot.findMany({
      where: { symbol: { in: symbols } },
      select: { symbol: true, ltp: true, close: true },
    });

    const snapshotMap = new Map(snapshots.map((s) => [s.symbol, s]));

    let currentValue = 0;
    let prevCloseValue = 0;

    for (const holding of holdings) {
      const snap = snapshotMap.get(holding.symbol);
      if (!snap?.close) return null; // missing close → can't compute
      const qty = holding.quantity;
      currentValue += qty * snap.ltp.toNumber();
      prevCloseValue += qty * snap.close.toNumber();
    }

    if (prevCloseValue === 0) return null;
    return ((currentValue - prevCloseValue) / prevCloseValue) * 100;
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error): void {
    this.logger.error(`portfolio-events job ${job.id} failed: ${err.message}`);
  }
}
