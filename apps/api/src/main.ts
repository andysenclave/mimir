// Mimir API — bootstrap.
// CLAUDE.md §13 — global validation pipe; structured logger; graceful shutdown.
// MM-016 — Sentry init MUST happen before NestFactory.create so it can capture
// bootstrap-time errors. Keep it as the very first line of bootstrap().

import 'reflect-metadata';

import { TOP_100_NSE_SYMBOLS } from '@mimir/shared';
import { getQueueToken } from '@nestjs/bullmq';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Queue } from 'bullmq';

import { AppModule } from './app.module';
import { AI_PRECOMPUTE_QUEUE, AI_PRECOMPUTE_JOB } from './jobs/ai-precompute-cron.processor';
import { BUDGET_NUDGE_QUEUE, BUDGET_NUDGE_JOB } from './jobs/budget-nudge.processor';
import { PORTFOLIO_EVENTS_QUEUE, PORTFOLIO_EVENTS_JOB } from './jobs/portfolio-events.processor';
import { MARKET_DATA_POLL_QUEUE } from './modules/market/processors/market-data-poller.processor';
import { initSentryEarly } from './observability/sentry.bootstrap';

async function bootstrap(): Promise<void> {
  initSentryEarly();

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  // MM-021 — register cron schedulers for MarketDataPoller.
  // upsertJobScheduler is idempotent: safe to re-run on every deploy.
  // The processor's isMarketOpen() guard skips jobs outside NSE hours.
  const marketQueue = app.get<Queue>(getQueueToken(MARKET_DATA_POLL_QUEUE));
  await marketQueue.upsertJobScheduler(
    'market-poll',
    // 6-field BullMQ cron: every 15 seconds, Mon–Fri only.
    // Off-hours jobs still fire but the processor returns early (isMarketOpen guard).
    { pattern: '*/15 * * * * 1-5', tz: 'Asia/Kolkata' },
    { name: 'poll', data: { symbols: [...TOP_100_NSE_SYMBOLS] } },
  );

  // MM-033 — AI pre-compute cron: daily 9:00 AM IST for top 100 NSE stocks.
  // upsertJobScheduler is idempotent — safe on every deploy.
  const aiPrecomputeQueue = app.get<Queue>(getQueueToken(AI_PRECOMPUTE_QUEUE));
  await aiPrecomputeQueue.upsertJobScheduler(
    'ai-daily-precompute',
    { pattern: '0 9 * * *', tz: 'Asia/Kolkata' }, // 9:00 AM IST daily
    { name: AI_PRECOMPUTE_JOB, data: {} },
  );

  // MM-040 — budget-nudge cron: 09:00 IST on 15th + last 3 calendar days of month.
  // 28/29/30/31 covers all months; 31 simply won't fire in shorter months (BullMQ handles gracefully).
  const budgetNudgeQueue = app.get<Queue>(getQueueToken(BUDGET_NUDGE_QUEUE));
  await budgetNudgeQueue.upsertJobScheduler(
    'budget-nudge-cron',
    { pattern: '0 9 15,28,29,30,31 * *', tz: 'Asia/Kolkata' },
    { name: BUDGET_NUDGE_JOB, data: {} },
  );

  // MM-040 — portfolio-events cron: 15:30 IST on weekdays (30 min after NSE close).
  const portfolioEventsQueue = app.get<Queue>(getQueueToken(PORTFOLIO_EVENTS_QUEUE));
  await portfolioEventsQueue.upsertJobScheduler(
    'portfolio-events-cron',
    { pattern: '0 30 15 * * 1-5', tz: 'Asia/Kolkata' }, // 6-field with weekday
    { name: PORTFOLIO_EVENTS_JOB, data: {} },
  );

  console.info(`[mimir-api] listening on :${port}`);
}

void bootstrap();
