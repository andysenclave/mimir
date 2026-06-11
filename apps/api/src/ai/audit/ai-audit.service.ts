// CLAUDE.md §9 — audit logging is mandatory on every LLM call (success, failure, cached).
// Retention: 1 year, then hard-deleted.

import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

export interface AuditLogEntry {
  userId?: string | null;
  symbol?: string | null;
  prompt: string;
  response?: string | null;
  promptVersion: string;
  model: string;
  tokenCount?: number | null;
  latencyMs?: number | null;
  cachedHit: boolean;
  failureReason?: string | null;
}

@Injectable()
export class AIAuditService {
  private readonly logger = new Logger(AIAuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.aIAuditLog.create({
        data: {
          userId: entry.userId ?? null,
          symbol: entry.symbol ?? null,
          prompt: entry.prompt,
          response: entry.response ?? null,
          promptVersion: entry.promptVersion,
          model: entry.model,
          tokenCount: entry.tokenCount ?? null,
          latencyMs: entry.latencyMs ?? null,
          cachedHit: entry.cachedHit,
          failureReason: entry.failureReason ?? null,
        },
      });
    } catch (err) {
      // Never let audit logging failure surface to the caller.
      // Log the error for Sentry but swallow it.
      this.logger.error('Failed to write AIAuditLog entry', err);
    }
  }
}
