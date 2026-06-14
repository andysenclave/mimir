// FallbackMarketDataProvider — wraps NseIndiaProvider (primary) + YahooFinanceProvider (fallback).
// MM-022: circuit breaker opens after 5 consecutive primary failures, retries primary after 30s.

import { Injectable, Logger } from '@nestjs/common';

import {
  MarketDataProvider,
  type IndexQuote,
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

  async getMarketOverview(): Promise<MarketOverview> {
    return this.withFallback(
      () => this.primary.getMarketOverview(),
      () => this.fallback.getMarketOverview(),
      'getMarketOverview',
    );
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
        // Emit to PostHog via logger context — full telemetry wired in MM-023.
        // Fall through to fallback.
      }
    } else {
      this.logger.debug(`Circuit OPEN — skipping primary for ${label}, using fallback`);
    }

    return fallbackFn();
  }
}
