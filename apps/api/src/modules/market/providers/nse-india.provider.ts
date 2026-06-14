// NseIndiaProvider — primary market data source using the unofficial NSE India API.
// MM-022. Wrapped by FallbackMarketDataProvider — never injected directly.
//
// Performance note: getMarketOverview uses a SINGLE getAllIndices() call (≈700ms)
// to derive indices + sectors. Previously made 13 concurrent
// getEquityStockIndices() calls which triggered NSE rate-limiting and caused
// the market tab to hang or error.
// Top movers are NOT derived here — index rows aren't tradeable. MarketService
// computes them from the polled MarketSnapshot (real equities).
//
// getAllIndices() row shape: { index, indexSymbol, last, variation, percentChange, ... }
// Note: field is `index` (not `indexName`) and `variation`/`percentChange` (not `change`/`percChange`).

import { Injectable } from '@nestjs/common';
import { NseIndia } from 'stock-nse-india';

import {
  MarketDataProvider,
  type IndexQuote,
  type IntradayPoint,
  type MarketOverview,
  type SectorPerformance,
  type StockQuote,
} from './market-data-provider.interface';

// Sector indices + display names used to pick rows out of getAllIndices().
const NSE_SECTOR_MAP: ReadonlyArray<{ index: string; displayName: string }> = [
  { index: 'NIFTY BANK',   displayName: 'Banking' },
  { index: 'NIFTY IT',     displayName: 'IT'      },
  { index: 'NIFTY PHARMA', displayName: 'Pharma'  },
  { index: 'NIFTY AUTO',   displayName: 'Auto'    },
  { index: 'NIFTY FMCG',   displayName: 'FMCG'   },
  { index: 'NIFTY METAL',  displayName: 'Metals'  },
  { index: 'NIFTY REALTY', displayName: 'Realty'  },
  { index: 'NIFTY ENERGY', displayName: 'Energy'  },
  { index: 'NIFTY INFRA',  displayName: 'Infra'   },
  { index: 'NIFTY MEDIA',  displayName: 'Media'   },
];

// Main indices shown in the ticker bar.
const NSE_MAIN_INDICES = ['NIFTY 50', 'NIFTY BANK', 'SENSEX'];

// Internal shape returned by getAllIndices().
interface NseAllIndicesRow {
  index?: string;
  indexSymbol?: string;
  last?: number;
  variation?: number;
  percentChange?: number;
}

@Injectable()
export class NseIndiaProvider extends MarketDataProvider {
  private readonly nse = new NseIndia();

  async getQuote(symbol: string): Promise<StockQuote> {
    const data = await this.nse.getEquityDetails(symbol);
    const pd = data.priceInfo;
    return {
      symbol,
      name: data.info?.companyName,
      ltp: pd.lastPrice,
      open: pd.open,
      high: pd.intraDayHighLow?.max,
      low: pd.intraDayHighLow?.min,
      close: pd.previousClose,
      change: pd.change,
      changePct: pd.pChange,
      fetchedAt: new Date(),
    };
  }

  async getQuotes(symbols: string[]): Promise<StockQuote[]> {
    const results = await Promise.allSettled(symbols.map((s) => this.getQuote(s)));
    return results
      .filter((r): r is PromiseFulfilledResult<StockQuote> => r.status === 'fulfilled')
      .map((r) => r.value);
  }

  /**
   * Intraday price series for a symbol.
   * NSE returns normalised ratios in grapthData[i][1] (e.g. 0.98, 1.02).
   * We multiply by the closePrice field to get absolute INR values.
   * Returns [] when market is closed or data is unavailable.
   */
  async getIntradayData(symbol: string): Promise<IntradayPoint[]> {
    const data = await this.nse.getEquityIntradayData(symbol) as {
      grapthData?: [number, number, string][];
      closePrice?: number;
    };
    const points = data?.grapthData;
    const close = data?.closePrice ?? 1;
    if (!points || points.length === 0) return [];

    // The reference price is the last known LTP for absolute values.
    // Fetch current LTP to scale correctly; fall back to closePrice.
    let refPrice = close;
    try {
      const quote = await this.getQuote(symbol);
      refPrice = quote.ltp > 0 ? quote.ltp : close;
    } catch {
      // keep refPrice = close
    }

    return points.map(([timestamp, ratio]) => ({
      timestamp,
      price: parseFloat((ratio * refPrice).toFixed(2)),
    }));
  }

  async getIndexQuote(indexSymbol: string): Promise<IndexQuote> {
    const data = await this.nse.getEquityStockIndices(indexSymbol);
    const meta = data.metadata;
    return {
      symbol: indexSymbol,
      name: meta.indexName ?? indexSymbol,
      ltp: meta.last,
      change: meta.change,
      changePct: meta.percChange,
      fetchedAt: new Date(),
    };
  }

  /**
   * Single-call overview: one getAllIndices() request (≈700ms) provides
   * all data instead of 13 concurrent getEquityStockIndices() calls.
   */
  async getMarketOverview(): Promise<MarketOverview> {
    const allData = await this.nse.getAllIndices() as { data?: NseAllIndicesRow[] };
    const rows = (allData?.data ?? []).filter(
      (r): r is NseAllIndicesRow & { index: string } =>
        typeof r.index === 'string' && r.index.length > 0,
    );

    const rowByName = new Map(rows.map((r) => [r.index, r]));
    const now = new Date();

    // ── Main indices (ticker bar) ────────────────────────────────────────────
    const indices: IndexQuote[] = NSE_MAIN_INDICES
      .map((name) => {
        const r = rowByName.get(name);
        if (!r) return null;
        return {
          symbol: name,
          name,
          ltp: r.last ?? 0,
          change: r.variation ?? 0,
          changePct: r.percentChange ?? 0,
          fetchedAt: now,
        };
      })
      .filter((q): q is IndexQuote => q !== null);

    // ── Sectors ──────────────────────────────────────────────────────────────
    const sectors: SectorPerformance[] = NSE_SECTOR_MAP
      .map(({ index, displayName }) => {
        const r = rowByName.get(index);
        if (!r) return null;
        return { name: index, displayName, changePct: r.percentChange ?? 0 };
      })
      .filter((s): s is SectorPerformance => s !== null);

    // ── Top movers ────────────────────────────────────────────────────────────
    // Intentionally empty here. getAllIndices() only returns INDEX rows, whose
    // "symbols" are index names (e.g. "NIFTY50 DIVIDEND POINTS") that aren't
    // tradeable equities. MarketService computes top movers from the polled
    // MarketSnapshot (real NSE stocks) instead — see getTopMoversFromSnapshots().
    return { indices, topGainers: [], topLosers: [], sectors, fetchedAt: now };
  }
}
