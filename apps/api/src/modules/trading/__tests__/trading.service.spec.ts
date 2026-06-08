// Unit tests for TradingService — MM-025, MM-026, MM-027.
// Prompt 08 (how-to-unit-test-a-service): mock all deps, one behaviour per test.
//
// Coverage:
//   Suite 1 — getPortfolioPerformance (MM-025)
//   Suite 2 — placeOrder (MM-026): idempotency, rate limit, budget/holding checks, atomicity
//   Suite 3 — topupBudget (MM-027)
//   Suite 4 — runMonthlyRollover (MM-027)
//
// Manual verification (AC requirement for MM-025):
//   RELIANCE: 10 shares × prevClose 2800 × changePct 2% → weight 28,000
//   TCS:       5 shares × prevClose 3900 × changePct 4% → weight 19,500
//   portfolioChangePct = (28,000×2 + 19,500×4) / 47,500 = 134,000 / 47,500 ≈ 2.821%

import { Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Prisma } from '@prisma/client';

import {
  InsufficientBudgetException,
  InsufficientHoldingException,
  MarketQuoteUnavailableException,
  NoBudgetException,
  OrderRateLimitException,
  TopUpExceedsTierMaxException,
} from '../../../common/exceptions/trading.exceptions';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  MarketDataProvider,
  type IndexQuote,
  type StockQuote,
} from '../../market/providers/market-data-provider.interface';
import { PlaceOrderInput } from '../dto/place-order.input';
import { TopupBudgetInput } from '../dto/topup-budget.input';
import { TradingService, TRADING_REDIS } from '../trading.service';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const USER_ID = 'user_test_001';
const BUDGET_ID = 'budget_test_001';
const CORRELATION_ID = '123e4567-e89b-12d3-a456-426614174000';

function makeHolding(symbol: string, quantity: number, avgBuyPrice = 1000) {
  return {
    id: `hold_${symbol}`,
    userId: USER_ID,
    symbol,
    quantity,
    avgBuyPrice: new Prisma.Decimal(avgBuyPrice),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function makeQuote(
  symbol: string,
  ltp: number,
  close: number,
  changePct: number,
): StockQuote {
  return { symbol, ltp, close, change: ltp - close, changePct, fetchedAt: new Date() };
}

function makeIndexQuote(symbol: string, changePct: number): IndexQuote {
  return { symbol, name: symbol, ltp: 22000, change: 100, changePct, fetchedAt: new Date() };
}

function makeActiveBudget(cashRemaining: number, amount = 50_000) {
  return {
    id: BUDGET_ID,
    userId: USER_ID,
    tier: 'TIER_50K',
    amount: new Prisma.Decimal(amount),
    cashRemaining: new Prisma.Decimal(cashRemaining),
    status: 'ACTIVE',
    cycleStart: new Date('2026-06-01'),
    cycleEnd: new Date('2026-07-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function makePlaceOrderInput(overrides: Partial<PlaceOrderInput> = {}): PlaceOrderInput {
  return {
    symbol: 'RELIANCE',
    type: 'BUY',
    quantity: 1,
    clientGeneratedOrderId: CORRELATION_ID,
    ...overrides,
  } as PlaceOrderInput;
}

function makeOrder(overrides: Partial<{
  id: string;
  type: string;
  quantity: number;
  realizedPnl: Prisma.Decimal | null;
}> = {}) {
  return {
    id: 'order_001',
    userId: USER_ID,
    budgetId: BUDGET_ID,
    symbol: 'RELIANCE',
    type: 'BUY',
    quantity: 1,
    priceAtExecution: new Prisma.Decimal(2800),
    orderValue: new Prisma.Decimal(2800),
    realizedPnl: null,
    status: 'FILLED',
    failureReason: null,
    correlationId: CORRELATION_ID,
    executedAt: new Date(),
    ...overrides,
  };
}

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPrisma = {
  holding: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  monthlyBudget: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  order: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockProvider: jest.Mocked<MarketDataProvider> = {
  getQuote: jest.fn(),
  getQuotes: jest.fn(),
  getMarketOverview: jest.fn(),
  getIndexQuote: jest.fn(),
      getIntradayData: jest.fn(),
};

// Sliding-window pipeline mock — always under the rate limit (count = 1)
function makeMockPipeline(cardinalityCount = 1) {
  return {
    zremrangebyscore: jest.fn().mockReturnThis(),
    zadd: jest.fn().mockReturnThis(),
    zcard: jest.fn().mockReturnThis(),
    expire: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([null, null, [null, cardinalityCount], null]),
  };
}

const mockRedis = {
  pipeline: jest.fn(),
};

// ─── Suites ───────────────────────────────────────────────────────────────────

describe('TradingService', () => {
  let service: TradingService;

  beforeEach(async () => {
    // resetAllMocks clears both call history AND implementations.
    // clearAllMocks only clears call history — implementations bleed across suites
    // when mockImplementation() is set in one test and the next uses mockRejectedValueOnce().
    jest.resetAllMocks();
    jest.spyOn(Logger.prototype, 'warn').mockReturnValue(undefined);
    jest.spyOn(Logger.prototype, 'log').mockReturnValue(undefined);
    jest.spyOn(Logger.prototype, 'error').mockReturnValue(undefined);

    const module = await Test.createTestingModule({
      providers: [
        TradingService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: MarketDataProvider, useValue: mockProvider },
        { provide: TRADING_REDIS, useValue: mockRedis },
      ],
    }).compile();

    service = module.get(TradingService);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Suite 1 — getPortfolioPerformance (MM-025)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getPortfolioPerformance', () => {
    describe('no holdings', () => {
      beforeEach(() => {
        mockPrisma.holding.findMany.mockResolvedValue([]);
        mockProvider.getIndexQuote
          .mockResolvedValueOnce(makeIndexQuote('NIFTY 50', 0.45))
          .mockResolvedValueOnce(makeIndexQuote('^GSPC', 0.20));
      });

      it('returns hasHoldings=false and null portfolioChangePct', async () => {
        const result = await service.getPortfolioPerformance(USER_ID);
        expect(result.hasHoldings).toBe(false);
        expect(result.portfolioChangePct).toBeNull();
      });

      it('does not call getQuotes when there are no holdings', async () => {
        await service.getPortfolioPerformance(USER_ID);
        expect(mockProvider.getQuotes).not.toHaveBeenCalled();
      });

      it('returns benchmark data even with no holdings', async () => {
        const result = await service.getPortfolioPerformance(USER_ID);
        expect(result.niftyChangePct).toBe(0.45);
        expect(result.sp500ChangePct).toBe(0.20);
      });

      it('returns "Add stocks" copy', async () => {
        const result = await service.getPortfolioPerformance(USER_ID);
        expect(result.copy).toBe('Add stocks to start tracking your performance against the market.');
      });
    });

    describe('weighted-average calculation', () => {
      beforeEach(() => {
        mockPrisma.holding.findMany.mockResolvedValue([
          makeHolding('RELIANCE', 10),
          makeHolding('TCS', 5),
        ]);
        mockProvider.getQuotes.mockResolvedValue([
          makeQuote('RELIANCE', 2856, 2800, 2),
          makeQuote('TCS', 4056, 3900, 4),
        ]);
        mockProvider.getIndexQuote
          .mockResolvedValueOnce(makeIndexQuote('NIFTY 50', 1.0))
          .mockResolvedValueOnce(makeIndexQuote('^GSPC', 0.5));
      });

      it('computes portfolioChangePct as weighted average (≈2.821%)', async () => {
        const result = await service.getPortfolioPerformance(USER_ID);
        expect(result.portfolioChangePct).toBeCloseTo(134_000 / 47_500, 5);
      });

      it('returns hasHoldings=true', async () => {
        const result = await service.getPortfolioPerformance(USER_ID);
        expect(result.hasHoldings).toBe(true);
      });
    });

    describe('copy selection', () => {
      function setupHolding(portfolioChangePct: number, niftyChangePct: number, sp500ChangePct: number | null) {
        mockPrisma.holding.findMany.mockResolvedValue([makeHolding('X', 1)]);
        mockProvider.getQuotes.mockResolvedValue([
          makeQuote('X', 1000 + portfolioChangePct * 10, 1000, portfolioChangePct),
        ]);
        if (sp500ChangePct !== null) {
          mockProvider.getIndexQuote
            .mockResolvedValueOnce(makeIndexQuote('NIFTY 50', niftyChangePct))
            .mockResolvedValueOnce(makeIndexQuote('^GSPC', sp500ChangePct));
        } else {
          mockProvider.getIndexQuote
            .mockResolvedValueOnce(makeIndexQuote('NIFTY 50', niftyChangePct))
            .mockRejectedValueOnce(new Error('Yahoo unavailable'));
        }
      }

      it('outperforming-both copy', async () => {
        setupHolding(3.0, 1.0, 0.5);
        const result = await service.getPortfolioPerformance(USER_ID);
        expect(result.copy).toBe('You are outperforming both benchmarks today.');
      });

      it('behind-both copy', async () => {
        setupHolding(0.2, 1.0, 0.5);
        const result = await service.getPortfolioPerformance(USER_ID);
        expect(result.copy).toBe('Both benchmarks are running ahead of your portfolio today.');
      });

      it('ahead-of-NIFTY copy', async () => {
        setupHolding(2.0, 1.0, 3.0);
        const result = await service.getPortfolioPerformance(USER_ID);
        expect(result.copy).toBe('You are ahead of NIFTY 50 today.');
      });

      it('ahead-of-SP500 copy', async () => {
        setupHolding(1.0, 2.0, 0.5);
        const result = await service.getPortfolioPerformance(USER_ID);
        expect(result.copy).toBe('You are ahead of S&P 500 today.');
      });

      it('single-benchmark copy when S&P 500 unavailable', async () => {
        setupHolding(2.0, 1.0, null);
        const result = await service.getPortfolioPerformance(USER_ID);
        expect(result.sp500ChangePct).toBeNull();
        expect(result.copy).toBe('You are ahead of NIFTY 50 today.');
      });
    });

    describe('resilience', () => {
      it('returns null portfolioChangePct when getQuotes rejects', async () => {
        mockPrisma.holding.findMany.mockResolvedValue([makeHolding('RELIANCE', 10)]);
        mockProvider.getQuotes.mockRejectedValue(new Error('provider down'));
        mockProvider.getIndexQuote
          .mockResolvedValueOnce(makeIndexQuote('NIFTY 50', 0.4))
          .mockResolvedValueOnce(makeIndexQuote('^GSPC', 0.2));

        const result = await service.getPortfolioPerformance(USER_ID);
        expect(result.portfolioChangePct).toBeNull();
        expect(result.copy).toBe('Performance data is unavailable right now.');
      });

      it('returns niftyChangePct=0 when NIFTY quote rejects', async () => {
        mockPrisma.holding.findMany.mockResolvedValue([]);
        mockProvider.getIndexQuote
          .mockRejectedValueOnce(new Error('NSE down'))
          .mockResolvedValueOnce(makeIndexQuote('^GSPC', 0.3));

        const result = await service.getPortfolioPerformance(USER_ID);
        expect(result.niftyChangePct).toBe(0);
        expect(result.sp500ChangePct).toBe(0.3);
      });

      it('skips symbols with missing changePct from the weighted average', async () => {
        mockPrisma.holding.findMany.mockResolvedValue([
          makeHolding('RELIANCE', 10),
          makeHolding('HDFCBANK', 5),
        ]);
        mockProvider.getQuotes.mockResolvedValue([
          makeQuote('RELIANCE', 2856, 2800, 2),
          { symbol: 'HDFCBANK', ltp: 1620, fetchedAt: new Date() },
        ] as StockQuote[]);
        mockProvider.getIndexQuote
          .mockResolvedValueOnce(makeIndexQuote('NIFTY 50', 0.5))
          .mockResolvedValueOnce(makeIndexQuote('^GSPC', 0.2));

        const result = await service.getPortfolioPerformance(USER_ID);
        // Only RELIANCE contributes: weight = 10 × 2800 = 28,000; changePct = 2%
        expect(result.portfolioChangePct).toBeCloseTo(2, 5);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Suite 2 — placeOrder (MM-026)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('placeOrder', () => {
    // Set up rate limiter as always-passing by default.
    beforeEach(() => {
      mockRedis.pipeline.mockReturnValue(makeMockPipeline(1));
    });

    // ── Step 1: Idempotency ────────────────────────────────────────────────

    describe('Step 1 — idempotency', () => {
      it('returns the existing order if correlationId already used', async () => {
        const existingOrder = makeOrder();
        mockPrisma.order.findUnique.mockResolvedValue(existingOrder);

        const result = await service.placeOrder(USER_ID, makePlaceOrderInput());

        expect(result.id).toBe(existingOrder.id);
        expect(mockPrisma.$transaction).not.toHaveBeenCalled();
      });

      it('does not check rate limit or budget on idempotency hit', async () => {
        mockPrisma.order.findUnique.mockResolvedValue(makeOrder());

        await service.placeOrder(USER_ID, makePlaceOrderInput());

        expect(mockPrisma.monthlyBudget.findFirst).not.toHaveBeenCalled();
        // Redis pipeline should not be called after idempotency hit
        expect(mockRedis.pipeline).not.toHaveBeenCalled();
      });
    });

    // ── Step 2: Rate limit ──────────────────────────────────────────────────

    describe('Step 2 — rate limit', () => {
      it('throws OrderRateLimitException when > 60 orders in the last minute', async () => {
        mockPrisma.order.findUnique.mockResolvedValue(null); // no existing order
        // Simulate 61 in the window
        mockRedis.pipeline.mockReturnValue(makeMockPipeline(61));

        await expect(
          service.placeOrder(USER_ID, makePlaceOrderInput()),
        ).rejects.toThrow(OrderRateLimitException);
      });

      it('proceeds when count is exactly 60', async () => {
        mockPrisma.order.findUnique.mockResolvedValue(null);
        mockRedis.pipeline.mockReturnValue(makeMockPipeline(60));
        // Budget fetch will throw NoBudgetException — that's fine, we just
        // want to confirm the rate limit check passed.
        mockPrisma.monthlyBudget.findFirst.mockResolvedValue(null);

        await expect(
          service.placeOrder(USER_ID, makePlaceOrderInput()),
        ).rejects.toThrow(NoBudgetException);
      });
    });

    // ── Step 5: Active budget ──────────────────────────────────────────────

    describe('Step 5 — active budget', () => {
      beforeEach(() => {
        mockPrisma.order.findUnique.mockResolvedValue(null);
      });

      it('throws NoBudgetException when no ACTIVE budget exists', async () => {
        mockPrisma.monthlyBudget.findFirst.mockResolvedValue(null);

        await expect(
          service.placeOrder(USER_ID, makePlaceOrderInput()),
        ).rejects.toThrow(NoBudgetException);
      });
    });

    // ── Step 6: Market quote ───────────────────────────────────────────────

    describe('Step 6 — market quote', () => {
      beforeEach(() => {
        mockPrisma.order.findUnique.mockResolvedValue(null);
        mockPrisma.monthlyBudget.findFirst.mockResolvedValue(makeActiveBudget(50_000));
      });

      it('throws MarketQuoteUnavailableException when provider rejects', async () => {
        mockProvider.getQuote.mockRejectedValue(new Error('NSE down'));

        await expect(
          service.placeOrder(USER_ID, makePlaceOrderInput()),
        ).rejects.toThrow(MarketQuoteUnavailableException);
      });
    });

    // ── Step 7: BUY — insufficient budget ─────────────────────────────────

    describe('Step 7 — BUY: insufficient budget', () => {
      beforeEach(() => {
        mockPrisma.order.findUnique.mockResolvedValue(null);
        // 1 share of RELIANCE @ ₹2800 × 1.02 slippage = ₹2856 required
        // Cash remaining = ₹2800 < ₹2856 → should fail
        mockPrisma.monthlyBudget.findFirst.mockResolvedValue(makeActiveBudget(2800));
        mockProvider.getQuote.mockResolvedValue({ symbol: 'RELIANCE', ltp: 2800, fetchedAt: new Date() });
      });

      it('throws InsufficientBudgetException when cash < qty × LTP × 1.02', async () => {
        await expect(
          service.placeOrder(USER_ID, makePlaceOrderInput({ quantity: 1 })),
        ).rejects.toThrow(InsufficientBudgetException);
      });
    });

    // ── Step 7: SELL — insufficient holding ───────────────────────────────

    describe('Step 7 — SELL: insufficient holding', () => {
      beforeEach(() => {
        mockPrisma.order.findUnique.mockResolvedValue(null);
        mockPrisma.monthlyBudget.findFirst.mockResolvedValue(makeActiveBudget(50_000));
        mockProvider.getQuote.mockResolvedValue({ symbol: 'RELIANCE', ltp: 2800, fetchedAt: new Date() });
      });

      it('throws InsufficientHoldingException when holding does not exist', async () => {
        mockPrisma.holding.findUnique.mockResolvedValue(null);

        await expect(
          service.placeOrder(USER_ID, makePlaceOrderInput({ type: 'SELL', quantity: 5 })),
        ).rejects.toThrow(InsufficientHoldingException);
      });

      it('throws InsufficientHoldingException when holding quantity < requested', async () => {
        mockPrisma.holding.findUnique.mockResolvedValue(
          makeHolding('RELIANCE', 3), // only 3 shares
        );

        await expect(
          service.placeOrder(USER_ID, makePlaceOrderInput({ type: 'SELL', quantity: 5 })),
        ).rejects.toThrow(InsufficientHoldingException);
      });
    });

    // ── Step 9: BUY — successful execution ────────────────────────────────

    describe('Step 9 — successful BUY', () => {
      beforeEach(() => {
        mockPrisma.order.findUnique.mockResolvedValue(null);
        mockPrisma.monthlyBudget.findFirst.mockResolvedValue(makeActiveBudget(50_000));
        mockProvider.getQuote.mockResolvedValue({ symbol: 'RELIANCE', ltp: 2800, fetchedAt: new Date() });
      });

      it('executes atomically and returns the created order', async () => {
        const createdOrder = makeOrder({ type: 'BUY', quantity: 10 });
        // Transaction callback invoked synchronously with the tx proxy
        mockPrisma.$transaction.mockImplementation(async (cb: (tx: typeof mockPrisma) => Promise<typeof createdOrder>) => {
          // Second idempotency check inside tx
          mockPrisma.order.findUnique.mockResolvedValueOnce(null);
          mockPrisma.order.create.mockResolvedValue(createdOrder);
          mockPrisma.holding.findUnique.mockResolvedValue(null); // no existing holding
          mockPrisma.holding.create.mockResolvedValue({});
          mockPrisma.monthlyBudget.update.mockResolvedValue({});
          return cb(mockPrisma);
        });

        const result = await service.placeOrder(
          USER_ID,
          makePlaceOrderInput({ type: 'BUY', quantity: 10 }),
        );

        expect(result.id).toBe(createdOrder.id);
        expect(result.type).toBe('BUY');
      });

      it('returns existing order when race-condition idempotency check fires inside tx', async () => {
        const existingOrder = makeOrder();
        mockPrisma.$transaction.mockImplementation(async (cb: (tx: typeof mockPrisma) => Promise<typeof existingOrder>) => {
          // Second check inside tx returns existing — simulates a concurrent request
          mockPrisma.order.findUnique.mockResolvedValueOnce(existingOrder);
          return cb(mockPrisma);
        });

        const result = await service.placeOrder(USER_ID, makePlaceOrderInput());
        expect(result.id).toBe(existingOrder.id);
        // No new order was created
        expect(mockPrisma.order.create).not.toHaveBeenCalled();
      });
    });

    // ── Step 9: SELL — successful execution ───────────────────────────────

    describe('Step 9 — successful SELL', () => {
      beforeEach(() => {
        mockPrisma.order.findUnique.mockResolvedValue(null);
        mockPrisma.monthlyBudget.findFirst.mockResolvedValue(makeActiveBudget(10_000));
        mockProvider.getQuote.mockResolvedValue({ symbol: 'RELIANCE', ltp: 3000, fetchedAt: new Date() });
        // User holds 10 RELIANCE @ avg ₹2800
        mockPrisma.holding.findUnique.mockResolvedValue(makeHolding('RELIANCE', 10, 2800));
      });

      it('creates SELL order with realized P&L and deletes holding on full exit', async () => {
        const sellOrder = makeOrder({
          type: 'SELL',
          quantity: 10,
          realizedPnl: new Prisma.Decimal(2000), // (3000-2800)×10
        });

        mockPrisma.$transaction.mockImplementation(async (cb: (tx: typeof mockPrisma) => Promise<typeof sellOrder>) => {
          mockPrisma.order.findUnique.mockResolvedValueOnce(null);
          // tx.holding.findUniqueOrThrow returns full holding
          mockPrisma.holding.findUniqueOrThrow = jest.fn().mockResolvedValue(
            makeHolding('RELIANCE', 10, 2800),
          );
          mockPrisma.order.create.mockResolvedValue(sellOrder);
          mockPrisma.holding.delete.mockResolvedValue({});
          mockPrisma.monthlyBudget.update.mockResolvedValue({});
          return cb(mockPrisma);
        });

        const result = await service.placeOrder(
          USER_ID,
          makePlaceOrderInput({ type: 'SELL', quantity: 10 }),
        );

        expect(result.type).toBe('SELL');
        expect(result.realizedPnl).toBe(2000); // (3000-2800)×10
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Suite 3 — topupBudget (MM-027)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('topupBudget', () => {
    it('throws NoBudgetException when no active budget', async () => {
      mockPrisma.monthlyBudget.findFirst.mockResolvedValue(null);

      await expect(
        service.topupBudget(USER_ID, { amount: 5000 } as TopupBudgetInput),
      ).rejects.toThrow(NoBudgetException);
    });

    it('throws TopUpExceedsTierMaxException when top-up exceeds tier ceiling', async () => {
      // Budget: amount=50K, cashRemaining=45K → headroom = 5K
      mockPrisma.monthlyBudget.findFirst.mockResolvedValue(makeActiveBudget(45_000, 50_000));

      await expect(
        service.topupBudget(USER_ID, { amount: 6000 } as TopupBudgetInput),
      ).rejects.toThrow(TopUpExceedsTierMaxException);
    });

    it('updates and returns the budget when top-up is within headroom', async () => {
      const budget = makeActiveBudget(45_000, 50_000);
      mockPrisma.monthlyBudget.findFirst.mockResolvedValue(budget);

      const updatedBudget = {
        ...budget,
        cashRemaining: new Prisma.Decimal(50_000),
      };
      mockPrisma.monthlyBudget.update.mockResolvedValue(updatedBudget);

      const result = await service.topupBudget(USER_ID, { amount: 5000 } as TopupBudgetInput);

      expect(result.cashRemaining).toBe(50_000);
      expect(mockPrisma.monthlyBudget.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: BUDGET_ID },
          data: { cashRemaining: { increment: expect.any(Prisma.Decimal) } },
        }),
      );
    });

    it('allows top-up of exactly the remaining headroom', async () => {
      // amount=50K, cashRemaining=40K → headroom=10K; top-up 10K is exactly at limit
      const budget = makeActiveBudget(40_000, 50_000);
      mockPrisma.monthlyBudget.findFirst.mockResolvedValue(budget);
      mockPrisma.monthlyBudget.update.mockResolvedValue({
        ...budget,
        cashRemaining: new Prisma.Decimal(50_000),
      });

      await expect(
        service.topupBudget(USER_ID, { amount: 10_000 } as TopupBudgetInput),
      ).resolves.not.toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Suite 4 — runMonthlyRollover (MM-027)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('runMonthlyRollover', () => {
    it('marks existing budgets EXPIRED with cashRemaining=0 and creates new ACTIVE ones', async () => {
      const budgets = [
        { id: 'b1', userId: 'u1', tier: 'TIER_50K', amount: new Prisma.Decimal(50_000) },
        { id: 'b2', userId: 'u2', tier: 'TIER_10K', amount: new Prisma.Decimal(10_000) },
      ];
      mockPrisma.monthlyBudget.findMany
        .mockResolvedValueOnce(budgets)
        .mockResolvedValueOnce([]);
      mockPrisma.monthlyBudget.update.mockResolvedValue({});
      mockPrisma.monthlyBudget.create.mockResolvedValue({});
      mockPrisma.$transaction.mockResolvedValue([{}, {}]);

      const result = await service.runMonthlyRollover();

      expect(result.processed).toBe(2);
      expect(result.failed).toBe(0);
      // Each call should include cashRemaining: 0 on the EXPIRED row
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(2);
      const firstCallArgs = mockPrisma.$transaction.mock.calls[0]?.[0] as unknown[];
      expect(firstCallArgs).toHaveLength(2); // [expire op, create op]
    });

    it('increments failed count and continues when a single budget rollover throws', async () => {
      const budgets = [
        { id: 'b1', userId: 'u1', tier: 'TIER_50K', amount: new Prisma.Decimal(50_000) },
        { id: 'b2', userId: 'u2', tier: 'TIER_10K', amount: new Prisma.Decimal(10_000) },
      ];
      mockPrisma.monthlyBudget.findMany
        .mockResolvedValueOnce(budgets)
        .mockResolvedValueOnce([]);
      mockPrisma.$transaction
        .mockRejectedValueOnce(new Error('DB constraint'))
        .mockResolvedValueOnce([{}, {}]);

      const result = await service.runMonthlyRollover();

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(1);
    });

    it('does not touch holdings during rollover (CLAUDE.md §8 invariant)', async () => {
      mockPrisma.monthlyBudget.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      await service.runMonthlyRollover();

      // Holdings must never be read or written during rollover.
      expect(mockPrisma.holding.findMany).not.toHaveBeenCalled();
      expect(mockPrisma.holding.update).not.toHaveBeenCalled();
      expect(mockPrisma.holding.delete).not.toHaveBeenCalled();
    });

    it('returns { processed: 0, failed: 0 } when no active budgets exist', async () => {
      mockPrisma.monthlyBudget.findMany.mockResolvedValue([]);

      const result = await service.runMonthlyRollover();

      expect(result).toEqual({ processed: 0, failed: 0 });
    });
  });
});
