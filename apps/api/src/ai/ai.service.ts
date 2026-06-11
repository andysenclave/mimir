// AIService — MM-032 core pipeline.
// CLAUDE.md §9: all AI generation goes through this module. Never inline LLM calls elsewhere.
// Prompt 14 (how-to-structure-a-service-method.md): every public method is one unit of work.
//
// Pipeline (per CLAUDE.md §9):
//   1. Feature-flag check (PostHog)
//   2. Cache hit → return immediately
//   3. Quota check (on-demand path only)
//   4. Fetch market context
//   5. Generate with up to 2 retries
//   6. Validate (length + banned words + hallucination heuristic)
//   7. Persist to Postgres + Redis + audit log
//   8. Return

import Anthropic from '@anthropic-ai/sdk';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MarketService } from '../modules/market/market.service';

import { AIAuditService } from './audit/ai-audit.service';
import { AICacheService, type CachedInsight } from './cache/ai-cache.service';
import { type AIInsightGql } from './entities/ai-insight.entity';
import {
  STOCK_INSIGHT_PROMPT_VERSION,
  STOCK_INSIGHT_SYSTEM_PROMPT,
  buildStockInsightUserMessage,
  type StockInsightInput,
} from './prompts/stock-insight';
import { QuotaService } from './quota/quota.service';
import { validateStockInsight } from './validators';

import type { Env } from '../config/env.schema';

const MODEL = 'claude-haiku-4-5';
const MAX_RETRIES = 2;
const MAX_TOKENS  = 200;

// Sector lookup for the hallucination heuristic anchor check.
// Hardcoded for Phase 1 — refreshed in Phase 2 from MarketService.
const SYMBOL_SECTOR_MAP: Record<string, string> = {
  RELIANCE: 'Energy', TCS: 'Technology', HDFCBANK: 'Banking',
  ICICIBANK: 'Banking', INFY: 'Technology', HINDUNILVR: 'FMCG',
  ITC: 'FMCG', SBIN: 'Banking', BHARTIARTL: 'Telecom',
  KOTAKBANK: 'Banking', LT: 'Infrastructure', AXISBANK: 'Banking',
  ASIANPAINT: 'Paints', MARUTI: 'Automobile', TITAN: 'Consumer Goods',
  BAJFINANCE: 'Financial Services', HCLTECH: 'Technology',
  SUNPHARMA: 'Pharma', WIPRO: 'Technology', ULTRACEMCO: 'Cement',
};

function sectorFor(symbol: string): string {
  return SYMBOL_SECTOR_MAP[symbol] ?? 'Diversified';
}

function symbolName(symbol: string): string {
  // Simple title-case — fine for P1; Phase 2 fetches from fundamentals API
  return symbol.charAt(0) + symbol.slice(1).toLowerCase();
}

export interface GenerateInsightOptions {
  /** Present → on-demand path: quota is checked and decremented. */
  userId?: string;
  /** Pre-compute path uses this to skip quota checks. */
  precomputed?: boolean;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly anthropic: Anthropic | null;

  constructor(
    private readonly config: ConfigService<Env>,
    private readonly market: MarketService,
    private readonly cache: AICacheService,
    private readonly quota: QuotaService,
    private readonly audit: AIAuditService,
  ) {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    this.anthropic = apiKey ? new Anthropic({ apiKey }) : null;
    if (!this.anthropic) {
      this.logger.warn('ANTHROPIC_API_KEY not set — AI insights will return null');
    }
  }

  /**
   * Generate (or retrieve cached) stock insight.
   * Returns null when:
   *   - ANTHROPIC_API_KEY not configured
   *   - Cache miss + market data unavailable
   *   - All retries exhausted (stale cache returned if available, else null)
   *   - Hard quota exceeded (throws AIQuotaExceededException — callers must handle)
   */
  async generateInsight(
    symbol: string,
    opts: GenerateInsightOptions = {},
  ): Promise<AIInsightGql | null> {
    if (!this.anthropic) return null;

    // 1. Cache check
    const cached = await this.cache.get(symbol);
    if (cached) {
      await this.audit.log({
        userId: opts.userId,
        symbol,
        prompt: '[cache]',
        response: cached.body,
        promptVersion: cached.promptVersion,
        model: cached.model,
        cachedHit: true,
      });
      return this.toGql(cached, { fromQuota: false, quotaWarning: false });
    }

    // 2. Quota check (on-demand only — pre-compute has no userId)
    let quotaWarning = false;
    if (opts.userId && !opts.precomputed) {
      const quotaStatus = await this.quota.checkAndIncrement(opts.userId);
      // checkAndIncrement throws AIQuotaExceededException if hard cap exceeded
      quotaWarning = quotaStatus.softCapWarning;
    }

    // 3. Fetch market context
    const insightInput = await this.buildInsightInput(symbol);
    if (!insightInput) {
      this.logger.warn(`Cannot build insight input for ${symbol} — market data unavailable`);
      return null;
    }

    // 4. Generate with retries
    const generated = await this.generateWithRetries(symbol, insightInput, opts.userId);

    if (!generated) {
      // All retries exhausted — fall back to stale cache
      const stale = await this.cache.getStale(symbol);
      if (stale) {
        return this.toGql(stale, { fromQuota: !!opts.userId, quotaWarning });
      }
      return null;
    }

    // 5. Persist + return
    const insight: CachedInsight = {
      symbol,
      body: generated.text,
      model: MODEL,
      promptVersion: STOCK_INSIGHT_PROMPT_VERSION,
      generatedAt: new Date(),
    };
    await this.cache.set(symbol, insight, { precomputed: !!opts.precomputed });

    return this.toGql(insight, {
      fromQuota: !!opts.userId && !opts.precomputed,
      quotaWarning,
    });
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private async buildInsightInput(symbol: string): Promise<StockInsightInput | null> {
    const quote = await this.market.getStockQuote(symbol).catch(() => null);
    if (!quote) return null;

    return {
      symbol,
      name: symbolName(symbol),
      sector: sectorFor(symbol),
      currentPrice: quote.ltp,
      changes: {
        '1d': quote.changePct ?? 0,
        '1w': 0,  // Phase 1: only 1d available from snapshot; 1w/1m added in Phase 2
        '1m': 0,
        qtd: 0,
        ytd: 0,
      },
      fundamentals: {},
    };
  }

  private async generateWithRetries(
    symbol: string,
    input: StockInsightInput,
    userId?: string,
  ): Promise<{ text: string; inputTokens: number; outputTokens: number } | null> {
    for (let attempt = 0; attempt < MAX_RETRIES + 1; attempt++) {
      const start = Date.now();
      let rawText: string | null = null;
      let usage: { input_tokens: number; output_tokens: number } = { input_tokens: 0, output_tokens: 0 };
      let failureReason: string | null = null;

      try {
        const response = await this.anthropic!.messages.create({
          model: MODEL,
          system: STOCK_INSIGHT_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: buildStockInsightUserMessage(input) }],
          max_tokens: MAX_TOKENS,
        });
        usage = response.usage;
        const block = response.content[0];
        rawText = block && block.type === 'text' ? block.text.trim() : null;
      } catch (err) {
        failureReason = `Anthropic API error: ${String(err)}`;
        this.logger.error(`AI generation attempt ${attempt + 1} failed for ${symbol}`, err);
      }

      const latencyMs = Date.now() - start;

      if (rawText) {
        const validation = validateStockInsight(rawText, symbol, input.sector);
        if (validation.ok) {
          await this.audit.log({
            userId,
            symbol,
            prompt: STOCK_INSIGHT_SYSTEM_PROMPT,
            response: rawText,
            promptVersion: STOCK_INSIGHT_PROMPT_VERSION,
            model: MODEL,
            tokenCount: usage.input_tokens + usage.output_tokens,
            latencyMs,
            cachedHit: false,
          });
          return {
            text: rawText,
            inputTokens: usage.input_tokens,
            outputTokens: usage.output_tokens,
          };
        }
        failureReason = validation.reason;
        this.logger.warn(`Validation failed (attempt ${attempt + 1}) for ${symbol}: ${validation.reason}`);
      }

      // Log the failed attempt
      await this.audit.log({
        userId,
        symbol,
        prompt: STOCK_INSIGHT_SYSTEM_PROMPT,
        response: rawText ?? '[generation_error]',
        promptVersion: STOCK_INSIGHT_PROMPT_VERSION,
        model: MODEL,
        tokenCount: usage.input_tokens + usage.output_tokens || null,
        latencyMs,
        cachedHit: false,
        failureReason: failureReason ?? undefined,
      });
    }

    return null;
  }

  private toGql(
    insight: CachedInsight,
    meta: { fromQuota: boolean; quotaWarning: boolean },
  ): AIInsightGql {
    return {
      symbol: insight.symbol,
      body: insight.body,
      model: insight.model,
      promptVersion: insight.promptVersion,
      generatedAt: insight.generatedAt.getTime(),
      fromQuota: meta.fromQuota,
      quotaWarning: meta.quotaWarning,
    };
  }
}
