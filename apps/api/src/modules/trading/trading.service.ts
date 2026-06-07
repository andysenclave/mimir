// TradingService — MM-025 stub.
// Full trading domain (orders, budget) lands in MM-026. This stub provides
// getPortfolioPerformance() for the Market Overview benchmark card.
//
// Prompt 14 (service-method): Validate → Resolve → Execute → Return.
// Prompt 29 (trading-domain-rules): holdings read-only here; mutations land in MM-026.

import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';
import { MarketDataProvider } from '../market/providers/market-data-provider.interface';

import { PortfolioPerformanceGql } from './entities/portfolio-performance.entity';

// ─── Copy templates ────────────────────────────────────────────────────────────
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

  constructor(
    private readonly prisma: PrismaService,
    private readonly marketProvider: MarketDataProvider,
  ) {}

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
        // Use previous close as weight (invested value at yesterday's close).
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
}
