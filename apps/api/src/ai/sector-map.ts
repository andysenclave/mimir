// Sector lookup shared by the AI pipeline (hallucination anchor check) and the
// portfolio-suggestion input builder (sector concentration %).
// Hardcoded for Phase 1/2 — refreshed from MarketService fundamentals in Phase 3.

export const SYMBOL_SECTOR_MAP: Record<string, string> = {
  RELIANCE: 'Energy', TCS: 'Technology', HDFCBANK: 'Banking',
  ICICIBANK: 'Banking', INFY: 'Technology', HINDUNILVR: 'FMCG',
  ITC: 'FMCG', SBIN: 'Banking', BHARTIARTL: 'Telecom',
  KOTAKBANK: 'Banking', LT: 'Infrastructure', AXISBANK: 'Banking',
  ASIANPAINT: 'Paints', MARUTI: 'Automobile', TITAN: 'Consumer Goods',
  BAJFINANCE: 'Financial Services', HCLTECH: 'Technology',
  SUNPHARMA: 'Pharma', WIPRO: 'Technology', ULTRACEMCO: 'Cement',
};

export function sectorFor(symbol: string): string {
  return SYMBOL_SECTOR_MAP[symbol] ?? 'Diversified';
}
