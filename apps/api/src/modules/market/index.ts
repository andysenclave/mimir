// Barrel export — module class + public types only.
// Prompt 06 (barrel-exports-and-index-files.md): internal services are NOT re-exported.

export { MarketModule } from './market.module';
export { MarketDataProvider, type StockQuote } from './providers/market-data-provider.interface';
export { MARKET_DATA_POLL_QUEUE, type PollJobData } from './processors/market-data-poller.processor';
