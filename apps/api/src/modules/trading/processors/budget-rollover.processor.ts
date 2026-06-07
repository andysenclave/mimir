// BudgetRolloverProcessor — MM-027.
// BullMQ cron processor that fires at 00:00 IST on the 1st of each month.
// Prompt 28 (how-to-write-a-worker): WorkerHost + @Processor + onModuleInit scheduling.
//
// 00:00 IST = 18:30 UTC on the last day of the previous month.
// BullMQ repeat with tz: 'Asia/Kolkata' handles DST-free IST arithmetic.

import { InjectQueue, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, OnModuleInit } from '@nestjs/common';
import { Queue, Job } from 'bullmq';

import { TradingService } from '../trading.service';

export const BUDGET_ROLLOVER_QUEUE = 'budget-rollover';

export interface RolloverJobData {
  triggeredBy: 'cron' | 'manual';
}

@Processor(BUDGET_ROLLOVER_QUEUE, { concurrency: 1 })
export class BudgetRolloverProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(BudgetRolloverProcessor.name);

  constructor(
    private readonly tradingService: TradingService,
    @InjectQueue(BUDGET_ROLLOVER_QUEUE) private readonly queue: Queue<RolloverJobData>,
  ) {
    super();
  }

  /**
   * Register the monthly cron repeat job on startup.
   * BullMQ uses the (name + repeat pattern) as a deduplication key, so calling
   * `add` with the same pattern on every restart is idempotent.
   */
  async onModuleInit(): Promise<void> {
    await this.queue.add(
      'monthly-rollover',
      { triggeredBy: 'cron' },
      {
        repeat: {
          // Fire at midnight IST (UTC+5:30) on the 1st of each month.
          pattern: '0 0 1 * *',
          tz: 'Asia/Kolkata',
        },
        removeOnComplete: { count: 3 },
        removeOnFail: { count: 5 },
      },
    );
    this.logger.log('Budget rollover cron registered (0 0 1 * * Asia/Kolkata)');
  }

  async process(job: Job<RolloverJobData>): Promise<{ processed: number; failed: number }> {
    this.logger.log(`Rollover job ${job.id} starting (triggeredBy: ${job.data.triggeredBy})`);

    const result = await this.tradingService.runMonthlyRollover();

    await job.updateProgress(100);
    this.logger.log(
      `Rollover job ${job.id} complete — processed: ${result.processed}, failed: ${result.failed}`,
    );
    return result;
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<RolloverJobData> | undefined, error: Error): void {
    this.logger.error(
      `Rollover job ${job?.id ?? 'unknown'} failed (attempt ${job?.attemptsMade ?? '?'})`,
      error.stack,
    );
  }
}
