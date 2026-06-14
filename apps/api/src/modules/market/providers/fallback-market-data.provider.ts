// FallbackMarketDataProvider — wraps NseIndiaProvider (primary) + YahooFinanceProvider (fallback).
// MM-022: circuit breaker opens after 5 consecutive primary failures, retries primary after 30s.

import { Injectable, Logger } from '@nestjs/common';

import {
  MarketDataProvider,
  type IndexQuote,
  type IntradayPoint,
  type MarketOverview,
  type StockQuote,
} from './market-data-provider.interface';
import { NseIndiaProvider } from './nse-india.provider';
import { YahooFinanceProvider } from './yahoo-finance.provider';

// ─── Circuit Breaker ─────────────────────────────────────────────────────────

const FAILURE_THRESHOLD = 5;       // consecutive failures before opening
const RETRY_AFTER_MS   = 30_000;   // half-open probe after 30s

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private consecutiveFailures = 0;
  private openedAt: number | null = null;

  get isOpen(): boolean {
    if (this.state === 'OPEN') {
      // Transition to HALF_OPEN after retry window.
      if (Date.now() - (this.openedAt ?? 0) >= RETRY_AFTER_MS) {
        this.state = 'HALF_OPEN';
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    this.consecutiveFailures = 0;
    this.state = 'CLOSED';
    this.openedAt = null;
  }

  recordFailure(): void {
    this.consecutiveFailures++;
    if (this.state === 'HALF_OPEN' || this.consecutiveFailures >= FAILURE_THRESHOLD) {
      this.state = 'OPEN';
      this.openedAt = Date.now();
    }
  }

  get currentState(): CircuitState { return this.state; }
}

// ─── Provider ────────────────────────────────────────────────────────────────

@Injectable()
export class FallbackMarketDataProvider extends MarketDataProvider {
  private readonly logger = new Logger(FallbackMarketDataProvider.name);
  private readonly circuit = new CircuitBreaker();

  constructor(
    private readonly primary: NseIndiaProvider,
    private readonly fallback: YahooFinanceProvider,
  ) {
    super();
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    return this.withFallback(
      () => this.primary.getQuote(symbol),
      () => this.fallback.getQuote(symbol),
      `getQuote(${symbol})`,
    );
  }

  async getQuotes(symbols: string[]): Promise<StockQuote[]> {
    return this.withFallback(
      () => this.primary.getQuotes(symbols),
      () => this.fallback.getQuotes(symbols),
      `getQuotes(${symbols.length} symbols)`,
    );
  }

  async getIndexQuote(indexSymbol: string): Promise<IndexQuote> {
    return this.withFallback(
      () => this.primary.getIndexQuote(indexSymbol),
      () => this.fallback.getIndexQuote(indexSymbol),
      `getIndexQuote(${indexSymbol})`,
    );
  }

  async getGlobalIndices(): Promise<IndexQuote[]> {
    // Global indices live only on Yahoo (NSE provider has no global data), so
    // skip the circuit breaker and call the fallback directly. Never throw —
    // an empty list just hides the Global Markets section.
    return this.fallback.getGlobalIndices().catch(() => []);
  }

  async getIntradayData(symbol: string): Promise<IntradayPoint[]> {
    return this.withFallback(
      () => this.primary.getIntradayData(symbol),
      () => this.fallback.getIntradayData(symbol),
      `getIntradayData(${symbol})`,
    ).catch(() => []);
  }

  async getMarketOverview(): Promise<MarketOverview> {
    // getMarketOverview is called directly by the resolver — if both providers
    // fail we must not throw, or Apollo returns a GraphQL error and mobile shows
    // the error state instead of stale data. Return an empty-but-valid overview
    // so the UI degrades gracefully (MarketService also has an in-process TTL
    // cache that will serve the last successful fetch on retry).
    try {
      return await this.withFallback(
        () => this.primary.getMarketOverview(),
        () => this.fallback.getMarketOverview(),
        'getMarketOverview',
      );
    } catch (err) {
      this.logger.error('Both market data providers failed for getMarketOverview — returning empty overview', { err: String(err) });
      return { indices: [], globalIndices: [], topGainers: [], topLosers: [], sectors: [], fetchedAt: new Date() };
    }
  }

  // ─── Circuit breaker core ─────────────────────────────────────────────────

  private async withFallback<T>(
    primaryFn: () => Promise<T>,
    fallbackFn: () => Promise<T>,
    label: string,
  ): Promise<T> {
    if (!this.circuit.isOpen) {
      try {
        const result = await primaryFn();
        this.circuit.recordSuccess();
        return result;
      } catch (err) {
        this.circuit.recordFailure();
        this.logger.warn(
          `Primary failed for ${label} (circuit: ${this.circuit.currentState}, failures: ${this.circuit['consecutiveFailures']})`,
          { err: String(err) },
        );
        // Fall through to fallback.
      }
    } else {
      this.logger.debug(`Circuit OPEN — skipping primary for ${label}, using fallback`);
    }

    return fallbackFn();
  }
}
