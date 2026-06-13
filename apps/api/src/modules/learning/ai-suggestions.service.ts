// MM-051 — portfolio-aware AI learning suggestions.
// Pipeline: Redis freshness gate (24h) → DB rows → regenerate via AIService →
// replace rows → re-arm gate. Failures degrade to stale rows, then to [].
// CLAUDE.md §9 — generation/validation/audit live in AIService; this service
// owns the per-user cache and persistence.

import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

import { AIService } from '../../ai/ai.service';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../redis/redis.module';

import type { AISuggestionGql } from './entities/ai-suggestion.entity';
import type { PortfolioSuggestionInput } from '../../ai/prompts/portfolio-suggestion';
import type { AISuggestion } from '@prisma/client';

const SUGGESTIONS_TTL_SEC = 24 * 3600;

function redisKey(userId: string): string {
  return `ai:suggestions:${userId}`;
}

function toGql(row: AISuggestion): AISuggestionGql {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    ctaLink: row.ctaLink,
    generatedAt: row.generatedAt.toISOString(),
  };
}

@Injectable()
export class AISuggestionsService {
  private readonly logger = new Logger(AISuggestionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AIService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async getAISuggestions(userId: string): Promise<AISuggestionGql[]> {
    // 1. Freshness gate — Redis stores an existence signal; rows live in Postgres.
    const fresh = await this.redis.get(redisKey(userId)).catch((err: unknown) => {
      this.logger.warn(`Redis read failed for suggestions of ${userId}`, err);
      return null;
    });
    if (fresh !== null) {
      const rows = await this.loadRows(userId);
      if (rows.length > 0) return rows.map(toGql);
      // Gate set but rows gone (e.g. manual cleanup) — fall through and regenerate.
    }

    // 2. Build generation input from portfolio + course state.
    const input = await this.buildInput(userId);

    // 3. Generate. On failure, degrade to stale rows (silent absence per CLAUDE.md §9).
    const cards = await this.ai.generatePortfolioSuggestions(userId, input);
    if (cards === null) {
      const stale = await this.loadRows(userId);
      return stale.map(toGql);
    }

    // 4. Replace old rows atomically, then re-arm the 24h gate.
    const rows = await this.prisma.$transaction(async (tx) => {
      await tx.aISuggestion.deleteMany({ where: { userId } });
      await tx.aISuggestion.createMany({
        data: cards.map((c) => ({ userId, title: c.title, body: c.body, ctaLink: c.ctaLink })),
      });
      return tx.aISuggestion.findMany({ where: { userId }, orderBy: { id: 'asc' } });
    });

    await this.redis
      .set(redisKey(userId), '1', 'EX', SUGGESTIONS_TTL_SEC)
      .catch((err: unknown) => this.logger.warn(`Redis write failed for suggestions of ${userId}`, err));

    return rows.map(toGql);
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private loadRows(userId: string): Promise<AISuggestion[]> {
    return this.prisma.aISuggestion.findMany({
      where: { userId },
      orderBy: { id: 'asc' },
    });
  }

  private async buildInput(userId: string): Promise<PortfolioSuggestionInput> {
    const [holdings, courses, progresses, concepts] = await Promise.all([
      this.prisma.holding.findMany({
        where: { userId },
        select: { symbol: true, quantity: true, avgBuyPrice: true },
      }),
      this.prisma.course.findMany({
        select: { id: true, title: true, description: true },
        orderBy: { orderIndex: 'asc' },
      }),
      this.prisma.courseProgress.findMany({
        where: { userId, completedAt: { not: null } },
        select: { courseId: true, course: { select: { title: true } } },
      }),
      this.prisma.concept.findMany({
        select: { id: true, title: true },
        orderBy: { orderIndex: 'asc' },
      }),
    ]);

    const completedIds = new Set(progresses.map((p) => p.courseId));

    return {
      sectorConcentrations: this.ai.buildSectorConcentrations(
        holdings.map((h) => ({
          symbol: h.symbol,
          quantity: h.quantity,
          avgBuyPrice: h.avgBuyPrice.toNumber(),
        })),
      ),
      completedCourses: progresses.map((p) => p.course.title),
      availableCourses: courses.filter((c) => !completedIds.has(c.id)),
      availableConcepts: concepts,
    };
  }
}
