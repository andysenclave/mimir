// Market data cron processor — BullMQ worker, 15s tick during NSE market hours.
// Prompt 28 (how-to-write-a-worker.md): cron processor pattern.
// MM-021: polls provider → publishes Redis tick → upserts MarketSnapshot.

import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { MarketService } from '../market.service';

export const MARKET_DATA_POLL_QUEUE = 'market-data-poll';

export interface PollJobData {
  symbols: string[];
}

@Processor(MARKET_DATA_POLL_QUEUE, { concurrency: 1 })
export class MarketDataPollerProcessor extends WorkerHost {
  private readonly logger = new Logger(MarketDataPollerProcessor.name);

  constructor(private readonly marketService: MarketService) {
    super();
  }

  async process(job: Job<PollJobData>): Promise<void> {
    const { symbols } = job.data;
    this.logger.debug(`Poll job ${job.id} — ${symbols.length} symbols`);

    const result = await this.marketService.pollAndPublish(symbols);

    if (result.published === 0 && result.failed === 0 && result.skipped === 0) {
      // Market closed — BullMQ still tracks the job but no work done.
      this.logger.debug(`Poll job ${job.id} — market closed, skipped`);
    }

    await job.updateProgress(100);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<PollJobData> | undefined, error: Error): void {
    this.logger.error(
      `Poll job ${job?.id ?? 'unknown'} failed (attempt ${job?.attemptsMade ?? '?'})`,
      error.stack,
    );
  }
}
