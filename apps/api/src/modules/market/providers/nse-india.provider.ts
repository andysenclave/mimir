// NseIndiaProvider — primary market data source using the unofficial NSE India API.
// MM-022. Wrapped by FallbackMarketDataProvider — never injected directly.

import { Injectable } from '@nestjs/common';
import { NseIndia } from 'stock-nse-india';

import {
  MarketDataProvider,
  type IndexQuote,
  type MarketOverview,
  type SectorPerformance,
  type StockQuote,
} from './market-data-provider.interface';

// NSE sector indices → human display names.
const NSE_SECTOR_MAP: ReadonlyArray<{ index: string; displayName: string }> = [
  { index: 'NIFTY BANK', displayName: 'Banking' },
  { index: 'NIFTY IT', displayName: 'IT' },
  { index: 'NIFTY PHARMA', displayName: 'Pharma' },
  { index: 'NIFTY AUTO', displayName: 'Auto' },
  { index: 'NIFTY FMCG', displayName: 'FMCG' },
  { index: 'NIFTY METAL', displayName: 'Metals' },
  { index: 'NIFTY REALTY', displayName: 'Realty' },
  { index: 'NIFTY ENERGY', displayName: 'Energy' },
  { index: 'NIFTY INFRA', displayName: 'Infra' },
  { index: 'NIFTY MEDIA', displayName: 'Media' },
];

// NSE indices for the ticker bar.
const NSE_MAIN_INDICES = ['NIFTY 50', 'NIFTY BANK'];

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
      // volume requires a separate getEquityTradeInfo() call — omitted for now, optional field
      fetchedAt: new Date(),
    };
  }

  async getQuotes(symbols: string[]): Promise<StockQuote[]> {
    const results = await Promise.allSettled(symbols.map((s) => this.getQuote(s)));
    return results
      .filter((r): r is PromiseFulfilledResult<StockQuote> => r.status === 'fulfilled')
      .map((r) => r.value);
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

  async getMarketOverview(): Promise<MarketOverview> {
    const [indicesResults, sectorResults, allIndicesData] = await Promise.all([
      Promise.allSettled(NSE_MAIN_INDICES.map((i) => this.getIndexQuote(i))),
      Promise.allSettled(NSE_SECTOR_MAP.map((s) => this.getIndexQuote(s.index))),
      this.nse.getAllIndices().catch(() => null),
    ]);

    const indices: IndexQuote[] = indicesResults
      .filter((r): r is PromiseFulfilledResult<IndexQuote> => r.status === 'fulfilled')
      .map((r) => r.value);

    const sectors: SectorPerformance[] = sectorResults
      .map((r, i) => {
        const entry = NSE_SECTOR_MAP[i];
        if (!entry || r.status === 'rejected') return null;
        const q = r.value;
        return { name: entry.index, displayName: entry.displayName, changePct: q.changePct };
      })
      .filter((s): s is SectorPerformance => s !== null);

    // Top movers from all-indices advance/decline data if available, else empty.
    const topGainers: StockQuote[] = [];
    const topLosers: StockQuote[] = [];

    if (allIndicesData?.data) {
      // Filter out entries where indexName is null/undefined/empty — the NSE API
      // occasionally returns incomplete rows that would violate StockQuoteGql.symbol: String!
      const validRows = allIndicesData.data.filter(
        (item): item is typeof item & { indexName: string } =>
          typeof item.indexName === 'string' && item.indexName.length > 0,
      );
      const sorted = [...validRows].sort((a, b) => b.percChange - a.percChange);

      for (const item of sorted.slice(0, 5)) {
        topGainers.push({
          symbol: item.indexName,
          name: item.indexName,
          ltp: item.last,
          change: item.change,
          changePct: item.percChange,
          fetchedAt: new Date(),
        });
      }
      for (const item of sorted.slice(-5).reverse()) {
        topLosers.push({
          symbol: item.indexName,
          name: item.indexName,
          ltp: item.last,
          change: item.change,
          changePct: item.percChange,
          fetchedAt: new Date(),
        });
      }
    }

    return { indices, topGainers, topLosers, sectors, fetchedAt: new Date() };
  }
}
