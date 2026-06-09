// MM-033 — Daily 9 AM IST AI pre-compute cron for top 100 NSE stocks.
// Prompt 28 (how-to-write-a-worker.md): idempotent, batched, no unbounded work.
// Runs sequentially to respect Anthropic rate limits — not parallel.
// Cost ceiling: ~$0.30/day for 100 stocks × ~$0.003 per call.

import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';

import { TOP_100_NSE_SYMBOLS } from '@mimir/shared';
import { AIService } from '../ai/ai.service';
import { PostHogService } from '../observability/posthog.service';

export const AI_PRECOMPUTE_QUEUE = 'ai-precompute';
export const AI_PRECOMPUTE_JOB  = 'precompute-stock-insights';

export interface AIPrecomputeJobData {
  symbols?: string[]; // defaults to TOP_100_NSE_SYMBOLS if absent
}

@Processor(AI_PRECOMPUTE_QUEUE, { concurrency: 1 })
@Injectable()
export class AIPrecomputeCronProcessor extends WorkerHost {
  private readonly logger = new Logger(AIPrecomputeCronProcessor.name);

  constructor(
    private readonly aiService: AIService,
    private readonly postHog: PostHogService,
  ) {
    super();
  }

  override async process(job: Job<AIPrecomputeJobData>): Promise<{ generated: number; skipped: number; failed: number }> {
    const symbols = job.data.symbols ?? [...TOP_100_NSE_SYMBOLS];
    this.logger.log(`Starting AI pre-compute for ${symbols.length} symbols`);

    let generated = 0;
    let skipped   = 0;
    let failed    = 0;

    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];
      if (!symbol) continue;

      try {
        const insight = await this.aiService.generateInsight(symbol, { precomputed: true });
        if (insight) {
          generated++;
        } else {
          skipped++; // cache hit or market data unavailable
        }
      } catch (err) {
        // Never swallow — log so Sentry picks it up, but continue the batch
        this.logger.error(`Pre-compute failed for ${symbol}`, err);
        failed++;
      }

      // Update BullMQ progress for visibility in the dashboard
      await job.updateProgress(Math.round(((i + 1) / symbols.length) * 100));
    }

    this.logger.log(`Pre-compute complete — generated:${generated} skipped:${skipped} failed:${failed}`);

    // Emit PostHog event for cost tracking
    this.postHog.capture('system', 'ai_precompute_completed', { generated, skipped, failed });

    return { generated, skipped, failed };
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    this.logger.error(`Pre-compute job failed after ${job.attemptsMade} attempt(s)`, {
      jobId: job.id,
      error: error.message,
    });
  }
}
