// MM-040 — Budget-nudge BullMQ worker.
// Cron: 09:00 IST on 15th + last 3 days of month.
// Per user: if cashRemaining / amount < 0.30 → dispatch BUDGET category push.
// Batches users in groups of 500 to avoid memory pressure.
// Prompt 28 (worker): extends WorkerHost, @Processor decorator, OnWorkerEvent for logging.

import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { NotificationCategory } from '@prisma/client';


import { NotificationDispatchService } from '../modules/notifications/notification-dispatch.service';
import { budgetNudgeTemplate } from '../modules/notifications/templates/budget-nudge';
import { PrismaService } from '../prisma/prisma.service';

import type { Job } from 'bullmq';

export const BUDGET_NUDGE_QUEUE = 'budget-nudge';
export const BUDGET_NUDGE_JOB = 'run-budget-nudge';

const BUDGET_LOW_THRESHOLD = 0.30; // 30% remaining triggers a nudge
const BATCH_SIZE = 500;

@Processor(BUDGET_NUDGE_QUEUE, { concurrency: 1 })
export class BudgetNudgeProcessor extends WorkerHost {
  private readonly logger = new Logger(BudgetNudgeProcessor.name);

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
      const budgets = await this.prisma.monthlyBudget.findMany({
        where: {
          status: 'ACTIVE',
          ...(cursor ? { id: { gt: cursor } } : {}),
        },
        select: {
          id: true,
          userId: true,
          amount: true,
          cashRemaining: true,
        },
        orderBy: { id: 'asc' },
        take: BATCH_SIZE,
      });

      for (const budget of budgets) {
        const amount = budget.amount.toNumber();
        if (amount === 0) continue;
        const remaining = budget.cashRemaining.toNumber();
        const pct = remaining / amount;
        if (pct < BUDGET_LOW_THRESHOLD) {
          const payload = budgetNudgeTemplate({
            cashRemainingInr: remaining,
            percentLeft: pct * 100,
          });
          await this.dispatch.dispatch(budget.userId, NotificationCategory.BUDGET, payload);
          dispatched++;
        }
      }

      cursor = budgets.length === BATCH_SIZE ? budgets[budgets.length - 1]?.id : undefined;
    } while (cursor !== undefined);

    this.logger.log(`budget-nudge: dispatched ${dispatched} notifications`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error): void {
    this.logger.error(`budget-nudge job ${job.id} failed: ${err.message}`);
  }
}
