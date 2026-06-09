// TradingService — MM-026 + MM-027.
//
// Implements:
//   • getPortfolioPerformance()  — MM-025 (benchmark comparison card)
//   • placeOrder()               — MM-026 (9-step validation chain + atomic Prisma tx)
//   • topupBudget()              — MM-027 (add virtual cash within tier ceiling)
//   • runMonthlyRollover()       — MM-027 (called by BudgetRolloverProcessor cron)
//
// Private helpers (within service, not exported):
//   • upsertHoldingOnBuy()       — VWAP avgBuyPrice update inside tx
//   • adjustHoldingOnSell()      — partial / full sell + realized P&L inside tx
//   • checkOrderRateLimit()      — Redis sliding-window, 60 orders/min/user
//   • toOrderGql()               — Prisma → GraphQL entity projection
//   • toBudgetGql()              — Prisma → GraphQL entity projection
//
// CLAUDE.md §8 invariants (always true):
//   1. Order + Holding + MonthlyBudget mutate atomically (single Prisma tx).
//   2. Each clientGeneratedOrderId → at most one Order row (idempotency).
//   3. Holding.quantity can never go negative.
//   4. MonthlyBudget.cashRemaining can never go negative.
//   5. Holding.avgBuyPrice = VWAP of all BUYs (recomputed on BUY, untouched on SELL).
//
// Prompt 14 (service-method): Validate → Resolve → Execute → Return.
// Prompt 29 (trading-domain-rules): locked validation chain order must not change.

import { placeOrderInputSchema } from '@mimir/shared';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import {
  InsufficientBudgetException,
  InsufficientHoldingException,
  MarketQuoteUnavailableException,
  NoBudgetException,
  OrderRateLimitException,
  TopUpExceedsTierMaxException,
} from '../../common/exceptions/trading.exceptions';
import { PrismaService } from '../../prisma/prisma.service';
import { STOCK_TICK_CHANNEL } from '../market/market.service';
import { MarketDataProvider } from '../market/providers/market-data-provider.interface';
import { StockPriceUpdate } from '../market/entities/stock-price-update.entity';

import { PlaceOrderInput } from './dto/place-order.input';
import { TopupBudgetInput } from './dto/topup-budget.input';
import { MonthlyBudgetGql } from './entities/monthly-budget.entity';
import { OrderGql } from './entities/order.entity';
import { PortfolioGql } from './entities/portfolio.entity';
import { PortfolioHoldingGql } from './entities/portfolio-holding.entity';
import { PortfolioPerformanceGql } from './entities/portfolio-performance.entity';
import { PortfolioUpdateGql } from './entities/portfolio-update.entity';
import { EquityPointGql } from './entities/equity-point.entity';

import type { RedisPubSub } from 'graphql-redis-subscriptions';
import type { Redis } from 'ioredis';


export const TRADING_REDIS = 'TRADING_REDIS';
export const TRADING_PUB_SUB = 'TRADING_PUB_SUB';

// ─── Copy templates (MM-025) ──────────────────────────────────────────────────
// Template-based motivational copy. Never LLM-generated (CLAUDE.md §9 + §10).
// SEBI-compliant: no buy/sell recommendations, no price predictions.

function selectCopy(opts: {
  hasHoldings: boolean;
  portfolioChangePct: number | null;
  niftyChangePct: number;
  sp500ChangePct: number | null;
}): string {
  if (!opts.hasHoldings) {
    return 'Add stocks to start tracking your performance against the market.';
  }
  if (opts.portfolioChangePct === null) {
    return 'Performance data is unavailable right now.';
  }

  const p = opts.portfolioChangePct;
  const aheadNifty = p > opts.niftyChangePct;
  const sp500Available = opts.sp500ChangePct !== null;
  const aheadSp500 = sp500Available && p > (opts.sp500ChangePct as number);

  if (sp500Available && aheadNifty && aheadSp500) {
    return 'You are outperforming both benchmarks today.';
  }
  if (sp500Available && !aheadNifty && !aheadSp500) {
    return 'Both benchmarks are running ahead of your portfolio today.';
  }
  if (aheadNifty) return 'You are ahead of NIFTY 50 today.';
  if (aheadSp500) return 'You are ahead of S&P 500 today.';
  return 'Benchmarks are running ahead of your portfolio today.';
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class TradingService {
  private readonly logger = new Logger(TradingService.name);

  /** Sliding-window rate-limit constants */
  private static readonly RATE_WINDOW_MS = 60_000;
  private static readonly RATE_LIMIT = 60;

  /** Slippage tolerance buffer applied to BUY cost estimate (2%) */
  private static readonly SLIPPAGE_FACTOR = new Prisma.Decimal('1.02');

  /** Budget rollover batch size (CLAUDE.md §8) */
  private static readonly ROLLOVER_BATCH_SIZE = 500;

  constructor(
    private readonly prisma: PrismaService,
    private readonly marketProvider: MarketDataProvider,
    @Inject(TRADING_REDIS) private readonly redis: Redis,
    @Inject(TRADING_PUB_SUB) private readonly pubSub: RedisPubSub,
  ) {}

  // ── MM-025 ────────────────────────────────────────────────────────────────

  /**
   * Compute the user's portfolio daily % change versus NIFTY 50 and S&P 500.
   *
   * Algorithm:
   *   weight_i       = holding.quantity × quote.previousClose   (invested at yesterday's close)
   *   portfolioChg   = Σ(weight_i × quote.changePct) / Σ(weight_i)
   *
   * Falls back gracefully at every step — returns null portfolio change rather
   * than throwing if prices are unavailable.
   */
  async getPortfolioPerformance(userId: string): Promise<PortfolioPerformanceGql> {
    // ── 1. Resolve ─────────────────────────────────────────────────────────────
    const holdings = await this.prisma.holding.findMany({ where: { userId } });
    const hasHoldings = holdings.length > 0;

    const symbols = holdings.map((h) => h.symbol);

    const [quotesRaw, niftyQuote, sp500Quote] = await Promise.all([
      symbols.length > 0
        ? this.marketProvider.getQuotes(symbols).catch((err: unknown) => {
            this.logger.warn('getQuotes failed in portfolioPerformance', { err: String(err) });
            return [];
          })
        : Promise.resolve([]),
      this.marketProvider.getIndexQuote('NIFTY 50').catch((err: unknown) => {
        this.logger.warn('getIndexQuote(NIFTY 50) failed', { err: String(err) });
        return null;
      }),
      this.marketProvider.getIndexQuote('^GSPC').catch((err: unknown) => {
        this.logger.warn('getIndexQuote(S&P 500) failed', { err: String(err) });
        return null;
      }),
    ]);

    // ── 2. Compute portfolio daily % change ────────────────────────────────────
    let portfolioChangePct: number | null = null;

    if (hasHoldings && quotesRaw.length > 0) {
      const quoteMap = new Map(quotesRaw.map((q) => [q.symbol, q]));
      let weightedChange = 0;
      let totalWeight = 0;

      for (const holding of holdings) {
        const quote = quoteMap.get(holding.symbol);
        if (!quote || quote.changePct === undefined || quote.changePct === null) continue;
        const prevClose = quote.close ?? quote.ltp;
        const weight = holding.quantity * prevClose;
        weightedChange += weight * quote.changePct;
        totalWeight += weight;
      }

      if (totalWeight > 0) {
        portfolioChangePct = weightedChange / totalWeight;
      }
    }

    // ── 3. Return ──────────────────────────────────────────────────────────────
    const niftyChangePct = niftyQuote?.changePct ?? 0;
    const sp500ChangePct = sp500Quote?.changePct ?? null;

    const copy = selectCopy({ hasHoldings, portfolioChangePct, niftyChangePct, sp500ChangePct });

    return { portfolioChangePct, niftyChangePct, sp500ChangePct, copy, hasHoldings };
  }

  // ── MM-026 ────────────────────────────────────────────────────────────────

  /**
   * Place a simulated market order following the locked 9-step validation chain
   * (CLAUDE.md §8). Atomicity invariant: Order + Holding + MonthlyBudget update
   * inside a single Prisma transaction. Any failure rolls back all changes.
   *
   * Step 1: Idempotency — return existing order if correlationId already used.
   * Step 2: Rate limit — ≤ 60 orders/min/user (Redis sliding window).
   * Step 3: Symbol format — enforced by DTO @Matches; quote fetch confirms existence.
   * Step 4: Quantity bounds — enforced by DTO @Min(1) @Max(1_000_000).
   * Step 5: Active budget — user must have an ACTIVE MonthlyBudget.
   * Step 6: Market quote — MarketDataProvider must return LTP.
   * Step 7: Type-specific — BUY checks cash; SELL checks holding quantity.
   * Step 8: Domain — Phase 1: MARKET orders only (type enforced by shared Zod schema).
   * Step 9: Execute — atomic Prisma transaction.
   */
  async placeOrder(userId: string, input: PlaceOrderInput): Promise<OrderGql> {
    // Runtime boundary: validate input against shared Zod schema.
    // class-validator on the DTO already runs; this double-check catches any
    // programmatic callers (e.g., tests) that bypass the GraphQL pipeline.
    // Runtime boundary: re-validates through the shared Zod schema.
    // class-validator on the DTO already runs for GraphQL callers; this catches
    // programmatic callers (e.g., tests) that bypass the GraphQL pipeline.
    placeOrderInputSchema.parse({
      symbol: input.symbol,
      type: input.type as 'BUY' | 'SELL',
      quantity: input.quantity,
      clientGeneratedOrderId: input.clientGeneratedOrderId,
    });

    // ── Step 1: Idempotency ────────────────────────────────────────────────────
    const existing = await this.prisma.order.findUnique({
      where: { correlationId: input.clientGeneratedOrderId },
    });
    if (existing) {
      this.logger.log(`Idempotency hit — returning existing order ${existing.id}`, { userId });
      return this.toOrderGql(existing);
    }

    // Shared context for all audit log entries in this attempt.
    const auditCtx = {
      userId,
      symbol: input.symbol,
      type: input.type,
      quantity: input.quantity,
      correlationId: input.clientGeneratedOrderId,
    };

    // ── Step 2: Rate limit ─────────────────────────────────────────────────────
    try {
      await this.checkOrderRateLimit(userId);
    } catch (err) {
      this.logger.warn('Order attempt rejected: rate limit exceeded', auditCtx);
      throw err;
    }

    // ── Steps 3–4: Symbol format + quantity bounds already validated by DTO ────

    // ── Step 5: Active budget ─────────────────────────────────────────────────
    const budget = await this.prisma.monthlyBudget.findFirst({
      where: { userId, status: 'ACTIVE' },
    });
    if (!budget) {
      this.logger.warn('Order attempt rejected: no active budget', auditCtx);
      throw new NoBudgetException(userId);
    }

    // ── Step 6: Market quote ──────────────────────────────────────────────────
    let ltp: number;
    try {
      const quote = await this.marketProvider.getQuote(input.symbol);
      ltp = quote.ltp;
    } catch {
      this.logger.warn('Order attempt rejected: market quote unavailable', auditCtx);
      throw new MarketQuoteUnavailableException(input.symbol);
    }

    const ltpDecimal = new Prisma.Decimal(ltp.toString());
    const quantityDecimal = new Prisma.Decimal(input.quantity.toString());
    const orderValue = quantityDecimal.mul(ltpDecimal);

    // ── Step 7: Type-specific validation ─────────────────────────────────────
    if (input.type === 'BUY') {
      // Required cash includes 2% slippage tolerance (CLAUDE.md §8).
      const required = orderValue.mul(TradingService.SLIPPAGE_FACTOR);
      if (budget.cashRemaining.lessThan(required)) {
        this.logger.warn('Order attempt rejected: insufficient budget', {
          ...auditCtx,
          ltp,
          cashRemaining: budget.cashRemaining.toNumber(),
          required: required.toNumber(),
        });
        throw new InsufficientBudgetException(
          budget.cashRemaining.toNumber(),
          required.toNumber(),
        );
      }
    } else {
      // SELL — verify the user holds enough shares.
      const holding = await this.prisma.holding.findUnique({
        where: { userId_symbol: { userId, symbol: input.symbol } },
      });
      if (!holding || holding.quantity < input.quantity) {
        this.logger.warn('Order attempt rejected: insufficient holding', {
          ...auditCtx,
          owned: holding?.quantity ?? 0,
        });
        throw new InsufficientHoldingException(
          input.symbol,
          input.quantity,
          holding?.quantity ?? 0,
        );
      }
    }

    // ── Step 8: Domain rules ──────────────────────────────────────────────────
    // Phase 1: MARKET orders only. Type validated by Zod (BUY | SELL).
    // No partial fills. Each call is one complete fill (quantity = filled quantity).

    // ── Step 9: Execute (atomic transaction) ──────────────────────────────────
    const order = await this.prisma.$transaction(async (tx) => {
      // Second idempotency check inside the transaction to handle concurrent
      // requests that both passed the pre-transaction check.
      const raceCheck = await tx.order.findUnique({
        where: { correlationId: input.clientGeneratedOrderId },
      });
      if (raceCheck) return raceCheck;

      if (input.type === 'BUY') {
        const created = await tx.order.create({
          data: {
            userId,
            budgetId: budget.id,
            symbol: input.symbol,
            type: 'BUY',
            quantity: input.quantity,
            priceAtExecution: ltpDecimal,
            orderValue,
            status: 'FILLED',
            correlationId: input.clientGeneratedOrderId,
          },
        });

        await this.upsertHoldingOnBuy(tx, userId, input.symbol, input.quantity, ltpDecimal);

        await tx.monthlyBudget.update({
          where: { id: budget.id },
          data: { cashRemaining: { decrement: orderValue } },
        });

        return created;
      } else {
        // SELL — compute realized P&L before creating the order.
        const holding = await tx.holding.findUniqueOrThrow({
          where: { userId_symbol: { userId, symbol: input.symbol } },
        });

        // Realized P&L = (sellPrice − avgBuyPrice) × quantity
        const realizedPnl = ltpDecimal.minus(holding.avgBuyPrice).mul(quantityDecimal);

        const created = await tx.order.create({
          data: {
            userId,
            budgetId: budget.id,
            symbol: input.symbol,
            type: 'SELL',
            quantity: input.quantity,
            priceAtExecution: ltpDecimal,
            orderValue,
            realizedPnl,
            status: 'FILLED',
            correlationId: input.clientGeneratedOrderId,
          },
        });

        await this.adjustHoldingOnSell(tx, holding, input.quantity);

        // Credit proceeds back to budget.
        await tx.monthlyBudget.update({
          where: { id: budget.id },
          data: { cashRemaining: { increment: orderValue } },
        });

        return created;
      }
    });

    this.logger.log(
      `Order ${order.id} executed — ${order.type} ${order.quantity}× ${order.symbol} @ ₹${ltp}`,
      { userId },
    );

    return this.toOrderGql(order);
  }

  // ── MM-027 — topupBudget ──────────────────────────────────────────────────

  /**
   * Add virtual cash to the user's current-month budget.
   * Constraint: cashRemaining + amount cannot exceed budget.amount (tier ceiling).
   */
  async topupBudget(userId: string, input: TopupBudgetInput): Promise<MonthlyBudgetGql> {
    const budget = await this.prisma.monthlyBudget.findFirst({
      where: { userId, status: 'ACTIVE' },
    });
    if (!budget) throw new NoBudgetException(userId);

    const topupDecimal = new Prisma.Decimal(input.amount.toString());
    const projected = budget.cashRemaining.plus(topupDecimal);

    if (projected.greaterThan(budget.amount)) {
      const headroom = budget.amount.minus(budget.cashRemaining);
      throw new TopUpExceedsTierMaxException(input.amount, headroom.toNumber());
    }

    const month = budget.cycleStart.toISOString().slice(0, 7); // 'YYYY-MM'
    const [updated] = await this.prisma.$transaction([
      this.prisma.monthlyBudget.update({
        where: { id: budget.id },
        data: { cashRemaining: { increment: topupDecimal } },
      }),
      // MM-035 AC: BudgetEvent row per top-up for audit trail
      this.prisma.budgetEvent.create({
        data: { userId, type: 'TOPUP', amount: topupDecimal, month },
      }),
    ]);

    this.logger.log(`Budget top-up ₹${input.amount} for budget ${budget.id}`, { userId });
    return this.toBudgetGql(updated);
  }

  // ── MM-027 — monthly rollover (called by BudgetRolloverProcessor) ─────────

  /**
   * Rolls over all active budgets to a new cycle for the 1st of the month.
   * Called by BudgetRolloverProcessor at 00:00 IST on the 1st of each month.
   *
   * For each user with an ACTIVE budget:
   *   1. Mark existing budget EXPIRED (row preserved for audit history).
   *   2. Create new ACTIVE budget at the same tier and initial amount.
   * Holdings are never touched (CLAUDE.md §8 — never liquidate on rollover).
   *
   * Processes users in batches of 500 to avoid memory exhaustion.
   */
  async runMonthlyRollover(): Promise<{ processed: number; failed: number }> {
    this.logger.log('Budget rollover starting');

    const now = new Date();
    const cycleStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const cycleEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    let processed = 0;
    let failed = 0;
    let cursor: string | undefined;

    for (;;) {
      const batch = await this.prisma.monthlyBudget.findMany({
        where: { status: 'ACTIVE' },
        take: TradingService.ROLLOVER_BATCH_SIZE,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        orderBy: { id: 'asc' },
        select: { id: true, userId: true, tier: true, amount: true },
      });

      if (batch.length === 0) break;

      for (const budget of batch) {
        try {
          const month = `${cycleStart.getUTCFullYear()}-${String(cycleStart.getUTCMonth() + 1).padStart(2, '0')}`;
          await this.prisma.$transaction([
            // Mark old budget EXPIRED and zero cashRemaining (STORIES.md MM-027).
            // Order history rows preserve the full spending audit trail.
            this.prisma.monthlyBudget.update({
              where: { id: budget.id },
              data: { status: 'EXPIRED', cashRemaining: new Prisma.Decimal(0) },
            }),
            this.prisma.monthlyBudget.create({
              data: {
                userId: budget.userId,
                tier: budget.tier,
                amount: budget.amount,
                cashRemaining: budget.amount,
                status: 'ACTIVE',
                cycleStart,
                cycleEnd,
              },
            }),
            // MM-035 AC: BudgetEvent row per cycle for audit trail
            this.prisma.budgetEvent.create({
              data: { userId: budget.userId, type: 'ROLLOVER', month },
            }),
          ]);
          processed++;
        } catch (err: unknown) {
          this.logger.error(`Rollover failed for budget ${budget.id}`, { err: String(err) });
          failed++;
        }
      }

      const lastItem = batch[batch.length - 1];
      cursor = lastItem?.id;

      if (batch.length < TradingService.ROLLOVER_BATCH_SIZE) break;
    }

    this.logger.log(`Budget rollover complete — processed: ${processed}, failed: ${failed}`);
    return { processed, failed };
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  /**
   * Upsert a holding after a BUY.
   * Invariant 5: avgBuyPrice = VWAP of all BUYs (recomputed on every BUY).
   *
   * Formula:
   *   newAvg = (existingQty × existingAvg + N × P) / (existingQty + N)
   */
  private async upsertHoldingOnBuy(
    tx: Prisma.TransactionClient,
    userId: string,
    symbol: string,
    qty: number,
    price: Prisma.Decimal,
  ): Promise<void> {
    const existing = await tx.holding.findUnique({
      where: { userId_symbol: { userId, symbol } },
    });

    const qtyDecimal = new Prisma.Decimal(qty.toString());

    if (!existing) {
      await tx.holding.create({
        data: { userId, symbol, quantity: qty, avgBuyPrice: price },
      });
    } else {
      const newQty = existing.quantity + qty;
      // VWAP: (old_qty × old_avg + new_qty × price) / total_qty
      const newAvg = new Prisma.Decimal(existing.quantity.toString())
        .mul(existing.avgBuyPrice)
        .plus(qtyDecimal.mul(price))
        .div(new Prisma.Decimal(newQty.toString()));

      await tx.holding.update({
        where: { id: existing.id },
        data: { quantity: newQty, avgBuyPrice: newAvg },
      });
    }
  }

  /**
   * Adjust a holding after a SELL.
   * If N === holding.quantity: delete the row (full exit).
   * If N < holding.quantity: decrement quantity, avgBuyPrice unchanged (invariant 5).
   * N > holding.quantity: guarded upstream in placeOrder — should never reach here.
   */
  private async adjustHoldingOnSell(
    tx: Prisma.TransactionClient,
    holding: { id: string; quantity: number },
    sellQty: number,
  ): Promise<void> {
    if (sellQty === holding.quantity) {
      await tx.holding.delete({ where: { id: holding.id } });
    } else {
      await tx.holding.update({
        where: { id: holding.id },
        data: { quantity: { decrement: sellQty } },
        // avgBuyPrice intentionally untouched on partial sell (invariant 5).
      });
    }
  }

  /**
   * Redis sliding-window rate limiter — 60 orders/min/user.
   *
   * Uses ZADD + ZREMRANGEBYSCORE + ZCARD in a pipeline.
   * Each entry's score is the Unix timestamp in ms; the value is a unique member.
   * Entries outside the 60s window are pruned on every check.
   */
  private async checkOrderRateLimit(userId: string): Promise<void> {
    const key = `rate:orders:${userId}`;
    const now = Date.now();
    const windowStart = now - TradingService.RATE_WINDOW_MS;
    // Unique member prevents collisions when two orders land in the same ms.
    const member = `${now}:${Math.random().toString(36).slice(2)}`;

    const pipeline = this.redis.pipeline();
    pipeline.zremrangebyscore(key, '-inf', windowStart.toString());
    pipeline.zadd(key, now, member);
    pipeline.zcard(key);
    pipeline.expire(key, 61);

    const results = await pipeline.exec();
    const count = (results?.[2]?.[1] as number | undefined) ?? 0;

    if (count > TradingService.RATE_LIMIT) {
      throw new OrderRateLimitException();
    }
  }

  // ── Projections ───────────────────────────────────────────────────────────

  private toOrderGql(order: {
    id: string;
    symbol: string;
    type: string;
    quantity: number;
    priceAtExecution: Prisma.Decimal;
    orderValue: Prisma.Decimal;
    realizedPnl: Prisma.Decimal | null;
    status: string;
    failureReason: string | null;
    correlationId: string;
    executedAt: Date;
  }): OrderGql {
    return {
      id: order.id,
      symbol: order.symbol,
      type: order.type,
      quantity: order.quantity,
      priceAtExecution: order.priceAtExecution.toNumber(),
      orderValue: order.orderValue.toNumber(),
      realizedPnl: order.realizedPnl?.toNumber() ?? null,
      status: order.status,
      failureReason: order.failureReason,
      correlationId: order.correlationId,
      executedAt: order.executedAt,
    };
  }

  private toBudgetGql(budget: {
    id: string;
    tier: string;
    amount: Prisma.Decimal;
    cashRemaining: Prisma.Decimal;
    status: string;
    cycleStart: Date;
    cycleEnd: Date;
  }): MonthlyBudgetGql {
    return {
      id: budget.id,
      tier: budget.tier,
      amount: budget.amount.toNumber(),
      cashRemaining: budget.cashRemaining.toNumber(),
      status: budget.status,
      cycleStart: budget.cycleStart,
      cycleEnd: budget.cycleEnd,
    };
  }

  // ── MM-030 (history tab) — chronological trade list ──────────────────────

  /**
   * Returns up to `limit` orders for `userId`, newest first.
   * Cursor-based pagination: pass the last order's `executedAt` ISO string
   * as `cursor` for the next page.
   */
  async getOrderHistory(
    userId: string,
    limit = 50,
    cursor?: string,
  ): Promise<OrderGql[]> {
    const orders = await this.prisma.order.findMany({
      where: {
        userId,
        status: 'FILLED',
        ...(cursor ? { executedAt: { lt: new Date(cursor) } } : {}),
      },
      orderBy: { executedAt: 'desc' },
      take: limit,
    });
    return orders.map((o) => this.toOrderGql(o));
  }

  // ── MM-030 — portfolio query ───────────────────────────────────────────────

  async getPortfolio(userId: string): Promise<PortfolioGql> {
    const [holdings, budget] = await Promise.all([
      this.prisma.holding.findMany({ where: { userId } }),
      this.prisma.monthlyBudget.findFirst({ where: { userId, status: 'ACTIVE' } }),
    ]);

    const symbols = holdings.map((h) => h.symbol);
    const quotes =
      symbols.length > 0
        ? await this.marketProvider.getQuotes(symbols).catch(() => [])
        : [];
    const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));

    const holdingsGql = this.buildHoldingGqls(holdings, quoteMap);
    const totalValue = holdingsGql.reduce((s, h) => s + h.totalValue, 0);
    const totalInvested = holdingsGql.reduce((s, h) => s + h.quantity * h.avgBuyPrice, 0);
    const totalPnl = totalValue - totalInvested;
    const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    const budgetGql = budget
      ? this.toBudgetGql(budget)
      : ({ id: '', tier: 'TIER_10K', amount: 0, cashRemaining: 0, status: 'ACTIVE', cycleStart: new Date(), cycleEnd: new Date() } as MonthlyBudgetGql);

    const equityCurve = await this.computeEquityCurve(
      userId,
      budget?.amount.toNumber() ?? 0,
      budget?.cashRemaining.toNumber() ?? 0,
      quoteMap,
    );

    return { holdings: holdingsGql, budget: budgetGql, totalValue, totalInvested, totalPnl, totalPnlPct, equityCurve };
  }

  // ── MM-031 — portfolioUpdate subscription ────────────────────────────────

  /**
   * Returns an AsyncGenerator that yields a PortfolioUpdateGql payload for every
   * relevant stock tick (throttled to 1Hz per user).
   *
   * Strategy: subscribe to the shared STOCK_TICK_CHANNEL. On each tick, check if
   * the user holds that symbol. If so (and the throttle allows), recompute the
   * full portfolio summary and yield it.
   */
  async *subscribeToPortfolioUpdates(userId: string): AsyncGenerator<{ portfolioUpdate: PortfolioUpdateGql }> {
    const holdings = await this.prisma.holding.findMany({ where: { userId } });
    const symbolSet = new Set(holdings.map((h) => h.symbol));

    if (symbolSet.size === 0) return;

    const iter = this.pubSub.asyncIterableIterator<{ stockPrice: StockPriceUpdate }>(STOCK_TICK_CHANNEL);
    let lastEmitMs = 0;

    for await (const payload of iter) {
      const tick = payload.stockPrice;
      if (!symbolSet.has(tick.symbol)) continue;

      const nowMs = Date.now();
      if (nowMs - lastEmitMs < 1_000) continue; // 1Hz throttle
      lastEmitMs = nowMs;

      const update = await this.computePortfolioUpdate(userId);
      if (update) yield { portfolioUpdate: update };
    }
  }

  // ── Private helpers (MM-030/031) ──────────────────────────────────────────

  private buildHoldingGqls(
    holdings: Array<{ symbol: string; quantity: number; avgBuyPrice: Prisma.Decimal }>,
    quoteMap: Map<string, { ltp: number; name?: string | null }>,
  ): PortfolioHoldingGql[] {
    return holdings.map((h) => {
      const quote = quoteMap.get(h.symbol);
      const ltp = quote?.ltp ?? h.avgBuyPrice.toNumber();
      const avgBuyPrice = h.avgBuyPrice.toNumber();
      const totalValue = h.quantity * ltp;
      const totalInvested = h.quantity * avgBuyPrice;
      const unrealizedPnl = totalValue - totalInvested;
      const unrealizedPnlPct = totalInvested > 0 ? (unrealizedPnl / totalInvested) * 100 : 0;
      return {
        symbol: h.symbol,
        name: quote?.name ?? null,
        quantity: h.quantity,
        avgBuyPrice,
        ltp,
        unrealizedPnl,
        unrealizedPnlPct,
        totalValue,
      };
    });
  }

  private async computePortfolioUpdate(userId: string): Promise<PortfolioUpdateGql | null> {
    const [holdings, budget] = await Promise.all([
      this.prisma.holding.findMany({ where: { userId } }),
      this.prisma.monthlyBudget.findFirst({ where: { userId, status: 'ACTIVE' } }),
    ]);

    if (!budget) return null;

    const symbols = holdings.map((h) => h.symbol);
    const quotes =
      symbols.length > 0
        ? await this.marketProvider.getQuotes(symbols).catch(() => [])
        : [];
    const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));
    const holdingsGql = this.buildHoldingGqls(holdings, quoteMap);

    const totalValue = holdingsGql.reduce((s, h) => s + h.totalValue, 0);
    const totalInvested = holdingsGql.reduce((s, h) => s + h.quantity * h.avgBuyPrice, 0);
    const totalPnl = totalValue - totalInvested;
    const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    return {
      totalValue,
      totalInvested,
      totalPnl,
      totalPnlPct,
      cashRemaining: budget.cashRemaining.toNumber(),
      holdings: holdingsGql,
    };
  }

  /**
   * Computes an approximate 30-day equity curve using current LTPs as a proxy.
   * Not historically accurate (no stored price snapshots) but shows trading activity.
   * Phase 1 approximation — replace with real historical data in a future story.
   */
  private async computeEquityCurve(
    userId: string,
    budgetAmount: number,
    currentCashRemaining: number,
    quoteMap: Map<string, { ltp: number }>,
  ): Promise<EquityPointGql[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 29);
    thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

    const orders = await this.prisma.order.findMany({
      where: { userId, status: 'FILLED', executedAt: { gte: thirtyDaysAgo } },
      select: { symbol: true, type: true, quantity: true, orderValue: true, executedAt: true },
      orderBy: { executedAt: 'asc' },
    });

    if (orders.length === 0) return [];

    const DAY_MS = 24 * 60 * 60 * 1_000;
    const now = new Date();
    const points: EquityPointGql[] = [];

    for (let i = 29; i >= 0; i--) {
      const dayEnd = new Date(now.getTime() - i * DAY_MS);
      dayEnd.setUTCHours(23, 59, 59, 999);
      const dayStr = dayEnd.toISOString().slice(0, 10);

      // Reconstruct holdings as of dayEnd
      const holdingMap = new Map<string, { qty: number }>();
      let netCashDeployed = 0;

      for (const order of orders) {
        if (order.executedAt > dayEnd) break;
        const ov = order.orderValue.toNumber();
        if (order.type === 'BUY') {
          const existing = holdingMap.get(order.symbol) ?? { qty: 0 };
          holdingMap.set(order.symbol, { qty: existing.qty + order.quantity });
          netCashDeployed += ov;
        } else {
          const existing = holdingMap.get(order.symbol);
          if (existing) {
            const newQty = existing.qty - order.quantity;
            if (newQty <= 0) holdingMap.delete(order.symbol);
            else holdingMap.set(order.symbol, { qty: newQty });
          }
          netCashDeployed -= ov;
        }
      }

      let holdingsValue = 0;
      for (const [symbol, { qty }] of holdingMap) {
        const ltp = quoteMap.get(symbol)?.ltp ?? 0;
        holdingsValue += qty * ltp;
      }

      // Cash at that point (approximation: budget - net deployed)
      const cashAtPoint = Math.max(0, budgetAmount - netCashDeployed);
      points.push({ date: dayStr, value: holdingsValue + cashAtPoint });
    }

    // Ensure last point reflects current state
    if (points.length > 0) {
      const lastIdx = points.length - 1;
      const holdingsNow = orders.reduce((map, order) => {
        if (order.type === 'BUY') {
          const ex = map.get(order.symbol) ?? 0;
          map.set(order.symbol, ex + order.quantity);
        } else {
          const ex = map.get(order.symbol) ?? 0;
          map.set(order.symbol, Math.max(0, ex - order.quantity));
        }
        return map;
      }, new Map<string, number>());

      let currentHoldingsValue = 0;
      for (const [symbol, qty] of holdingsNow) {
        if (qty > 0) currentHoldingsValue += qty * (quoteMap.get(symbol)?.ltp ?? 0);
      }
      points[lastIdx] = { ...points[lastIdx]!, value: currentHoldingsValue + currentCashRemaining };
    }

    return points;
  }

}
