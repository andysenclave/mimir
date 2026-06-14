// MM-057 — Educational-trigger BullMQ worker.
// Daily cron (09:30 IST). Connects the live market back to lessons a user has
// already studied: "TATAMOTORS fell 9% — revisit your Bear market lesson."
//
// Per CLAUDE.md §10 the copy is templated (educational.ts) and dispatched through
// NotificationDispatchService, so quiet hours + the per-category toggle + daily cap
// all apply. On top of that, an extra throttle caps EDUCATIONAL pushes at 1 per
// user per week to avoid fatigue (MM-057 subtask 4).
//
// Trigger model (works with the data the market layer actually has today —
// MarketSnapshot.changePct, the daily % move):
//   - A Concept may be tagged triggerKind 'PRICE_DROP' | 'PRICE_SURGE' + threshold.
//   - A user "studied" a concept if they completed the course that concept's
//     lesson belongs to (CourseProgress.completedAt set).
//   - If any stock the user holds moved past a studied concept's threshold today,
//     they get one nudge back to that concept.
//
// NOTE: the STORIES.md example uses a P/E threshold. Fundamentals (P/E) are not
// yet collected by the market layer, so this worker triggers on daily price moves.
// When fundamentals land, add a 'PE_BELOW' triggerKind here + in the seed — the
// surrounding machinery is unchanged.

import { InjectQueue, OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger, OnModuleInit } from '@nestjs/common';
import { NotificationCategory } from '@prisma/client';
import { Queue, Job } from 'bullmq';

import { NotificationDispatchService } from '../modules/notifications/notification-dispatch.service';
import { educationalTemplate } from '../modules/notifications/templates/educational';
import { PrismaService } from '../prisma/prisma.service';
import { REDIS_CLIENT } from '../redis/redis.module';

import type { Redis } from 'ioredis';

export const EDUCATIONAL_TRIGGERS_QUEUE = 'educational-triggers';
const EDUCATIONAL_TRIGGERS_JOB = 'scan-educational-triggers';

const BATCH_SIZE = 500;
const WEEKLY_THROTTLE_SEC = 7 * 24 * 3600; // max 1 educational push / user / week

const TRIGGER_PRICE_DROP = 'PRICE_DROP';
const TRIGGER_PRICE_SURGE = 'PRICE_SURGE';

interface TriggerConcept {
  id: string;
  title: string;
  courseId: string;
  triggerKind: string;
  triggerThreshold: number;
}

@Processor(EDUCATIONAL_TRIGGERS_QUEUE, { concurrency: 1 })
export class EducationalTriggersProcessor extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(EducationalTriggersProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dispatch: NotificationDispatchService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    @InjectQueue(EDUCATIONAL_TRIGGERS_QUEUE) private readonly queue: Queue,
  ) {
    super();
  }

  /** Register the daily cron on startup (idempotent — name+pattern dedupes). */
  async onModuleInit(): Promise<void> {
    await this.queue.add(
      EDUCATIONAL_TRIGGERS_JOB,
      {},
      {
        repeat: { pattern: '30 9 * * *', tz: 'Asia/Kolkata' },
        removeOnComplete: { count: 3 },
        removeOnFail: { count: 5 },
      },
    );
    this.logger.log('Educational-triggers cron registered (30 9 * * * Asia/Kolkata)');
  }

  async process(_job: Job): Promise<{ dispatched: number }> {
    // 1. Load tagged concepts, grouped by the course that "teaches" them.
    const concepts = await this.loadTriggerConcepts();
    if (concepts.length === 0) {
      this.logger.log('educational-triggers: no tagged concepts — nothing to do');
      return { dispatched: 0 };
    }
    const conceptsByCourse = new Map<string, TriggerConcept[]>();
    for (const c of concepts) {
      const list = conceptsByCourse.get(c.courseId) ?? [];
      list.push(c);
      conceptsByCourse.set(c.courseId, list);
    }

    // 2. Snapshot of today's daily moves, keyed by symbol.
    const snapshots = await this.prisma.marketSnapshot.findMany({
      select: { symbol: true, changePct: true },
    });
    const moveBySymbol = new Map<string, number>();
    for (const s of snapshots) {
      if (s.changePct !== null) moveBySymbol.set(s.symbol, s.changePct.toNumber());
    }

    // 3. Walk users who have completed at least one course, in batches.
    let cursor: string | undefined;
    let dispatched = 0;

    do {
      const progresses = await this.prisma.courseProgress.findMany({
        where: { completedAt: { not: null }, ...(cursor ? { id: { gt: cursor } } : {}) },
        select: { id: true, userId: true, courseId: true },
        orderBy: { id: 'asc' },
        take: BATCH_SIZE,
      });

      // Group this batch's completed courses by user.
      const coursesByUser = new Map<string, Set<string>>();
      for (const p of progresses) {
        const set = coursesByUser.get(p.userId) ?? new Set<string>();
        set.add(p.courseId);
        coursesByUser.set(p.userId, set);
      }

      for (const [userId, courseIds] of coursesByUser) {
        const match = await this.findMatchForUser(userId, courseIds, conceptsByCourse, moveBySymbol);
        if (match !== null && (await this.tryClaimWeeklySlot(userId))) {
          const payload = educationalTemplate({
            symbol: match.symbol,
            conceptTitle: match.concept.title,
            conceptId: match.concept.id,
            direction: match.changePct >= 0 ? 'up' : 'down',
            changePct: match.changePct,
          });
          await this.dispatch.dispatch(userId, NotificationCategory.EDUCATIONAL, payload);
          dispatched++;
        }
      }

      cursor =
        progresses.length === BATCH_SIZE ? progresses[progresses.length - 1]?.id : undefined;
    } while (cursor !== undefined);

    this.logger.log(`educational-triggers: dispatched ${dispatched} notifications`);
    return { dispatched };
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  private async loadTriggerConcepts(): Promise<TriggerConcept[]> {
    const rows = await this.prisma.concept.findMany({
      where: { triggerKind: { not: null }, lessonId: { not: null } },
      select: {
        id: true,
        title: true,
        triggerKind: true,
        triggerThreshold: true,
        lesson: { select: { courseId: true } },
      },
    });

    const out: TriggerConcept[] = [];
    for (const r of rows) {
      if (r.triggerKind === null || r.triggerThreshold === null || r.lesson === null) continue;
      out.push({
        id: r.id,
        title: r.title,
        courseId: r.lesson.courseId,
        triggerKind: r.triggerKind,
        triggerThreshold: r.triggerThreshold,
      });
    }
    return out;
  }

  /** First (held stock, studied concept) pair whose daily move clears the threshold. */
  private async findMatchForUser(
    userId: string,
    completedCourseIds: Set<string>,
    conceptsByCourse: Map<string, TriggerConcept[]>,
    moveBySymbol: Map<string, number>,
  ): Promise<{ symbol: string; concept: TriggerConcept; changePct: number } | null> {
    // Candidate concepts = those taught by a course the user has completed.
    const candidates: TriggerConcept[] = [];
    for (const courseId of completedCourseIds) {
      const list = conceptsByCourse.get(courseId);
      if (list) candidates.push(...list);
    }
    if (candidates.length === 0) return null;

    const holdings = await this.prisma.holding.findMany({
      where: { userId },
      select: { symbol: true },
    });
    if (holdings.length === 0) return null;

    for (const { symbol } of holdings) {
      const move = moveBySymbol.get(symbol);
      if (move === undefined) continue;
      for (const concept of candidates) {
        if (this.conditionMet(concept, move)) {
          return { symbol, concept, changePct: move };
        }
      }
    }
    return null;
  }

  private conditionMet(concept: TriggerConcept, changePct: number): boolean {
    if (concept.triggerKind === TRIGGER_PRICE_DROP) {
      return changePct <= -Math.abs(concept.triggerThreshold);
    }
    if (concept.triggerKind === TRIGGER_PRICE_SURGE) {
      return changePct >= Math.abs(concept.triggerThreshold);
    }
    return false;
  }

  /** Atomic 1-per-week claim. Returns true only for the first claim in the window. */
  private async tryClaimWeeklySlot(userId: string): Promise<boolean> {
    const key = `edu-notif:${userId}`;
    // SET key 1 NX EX <week> — succeeds (returns 'OK') only if not already set.
    const res = await this.redis.set(key, '1', 'EX', WEEKLY_THROTTLE_SEC, 'NX');
    return res === 'OK';
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error): void {
    this.logger.error(`educational-triggers job ${job.id} failed: ${err.message}`);
  }
}
