// AI-module typed exceptions — CLAUDE.md §13.
// Thrown by AIService / QuotaService; formatted by global exception filter.

import { HttpException, HttpStatus } from '@nestjs/common';

// ─── AI_QUOTA_EXCEEDED ────────────────────────────────────────────────────────

export class AIQuotaExceededException extends HttpException {
  constructor(_userId: string) {
    // userId intentionally not included in message — no PII in error responses.
    void _userId;
    super(
      {
        message: "You've reached today's AI insight limit. Check back tomorrow for fresh insights.",
        code: 'AI_QUOTA_EXCEEDED',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
