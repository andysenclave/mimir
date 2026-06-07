// Typed trading exceptions — CLAUDE.md §13.
// Thrown by TradingService; caught by the global exception filter which maps them
// to GraphQL errors with an extension `code` the mobile client can switch on.
// Prompt 17 (error-handling-patterns): never expose stack traces or internal messages.

import { BadRequestException, HttpException, HttpStatus, ServiceUnavailableException } from '@nestjs/common';

// ─── INSUFFICIENT_BUDGET ──────────────────────────────────────────────────────

export class InsufficientBudgetException extends BadRequestException {
  constructor(available: number, required: number) {
    super({
      message: `Insufficient budget: ₹${available.toFixed(2)} available, ₹${required.toFixed(2)} required (including 2% slippage buffer)`,
      code: 'INSUFFICIENT_BUDGET',
    });
  }
}

// ─── INSUFFICIENT_HOLDING ─────────────────────────────────────────────────────

export class InsufficientHoldingException extends BadRequestException {
  constructor(symbol: string, requested: number, owned: number) {
    super({
      message: `Cannot sell ${requested} shares of ${symbol}: you only hold ${owned}`,
      code: 'INSUFFICIENT_HOLDING',
    });
  }
}

// ─── NO_ACTIVE_BUDGET ─────────────────────────────────────────────────────────

export class NoBudgetException extends BadRequestException {
  constructor(userId: string) {
    // userId is intentionally not included in the message — no PII in error responses
    // (CLAUDE.md §19). It is logged separately with the correlation ID.
    void userId;
    super({
      message: 'No active budget found for this month. Please set up a budget to start trading.',
      code: 'NO_ACTIVE_BUDGET',
    });
  }
}

// ─── MARKET_UNAVAILABLE ───────────────────────────────────────────────────────

export class MarketQuoteUnavailableException extends ServiceUnavailableException {
  constructor(symbol: string) {
    super({
      message: `Market quote for ${symbol} is currently unavailable. Please try again.`,
      code: 'MARKET_UNAVAILABLE',
    });
  }
}

// ─── ORDER_RATE_LIMIT ─────────────────────────────────────────────────────────

export class OrderRateLimitException extends HttpException {
  constructor() {
    super(
      {
        message: 'You have placed too many orders in the last minute. Please wait before placing another.',
        code: 'ORDER_RATE_LIMIT',
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

// ─── TOPUP_EXCEEDS_MAX ────────────────────────────────────────────────────────

export class TopUpExceedsTierMaxException extends BadRequestException {
  constructor(requested: number, available: number) {
    super({
      message: `Top-up of ₹${requested.toFixed(2)} exceeds the available headroom of ₹${available.toFixed(2)} for your budget tier.`,
      code: 'TOPUP_EXCEEDS_MAX',
    });
  }
}
