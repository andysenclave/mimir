// CLAUDE.md §9 — per-user daily quota for on-demand AI insight calls.
// Soft cap: 5/day — allow but emit warning event.
// Hard cap: 20/day — block and throw AIQuotaExceededException.
// Redis sliding window keyed by userId + date (UTC).

import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.module';
import { AIQuotaExceededException } from '../../common/exceptions/ai.exceptions';

const SOFT_CAP = 5;
const HARD_CAP = 20;
const TTL_SEC  = 24 * 3600;

export interface QuotaStatus {
  used: number;
  remaining: number;
  softCapWarning: boolean;
}

@Injectable()
export class QuotaService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  /**
   * Increment quota counter and return status.
   * Throws AIQuotaExceededException if hard cap is already reached.
   */
  async checkAndIncrement(userId: string): Promise<QuotaStatus> {
    const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD' UTC
    const key   = `ai:quota:${userId}:${today}`;

    const used = await this.redis.incr(key);
    // Refresh TTL on each increment so the key survives until end of day
    await this.redis.expire(key, TTL_SEC);

    if (used > HARD_CAP) {
      // Roll back the counter so it stays at exactly HARD_CAP in the key
      await this.redis.decr(key);
      throw new AIQuotaExceededException(userId);
    }

    return {
      used,
      remaining: Math.max(0, HARD_CAP - used),
      softCapWarning: used > SOFT_CAP,
    };
  }

  /** Read-only peek — does not increment. Used by pre-compute path (no userId). */
  async peek(userId: string): Promise<QuotaStatus> {
    const today = new Date().toISOString().slice(0, 10);
    const raw   = await this.redis.get(`ai:quota:${userId}:${today}`);
    const used  = raw ? parseInt(raw, 10) : 0;
    return {
      used,
      remaining: Math.max(0, HARD_CAP - used),
      softCapWarning: used > SOFT_CAP,
    };
  }
}
