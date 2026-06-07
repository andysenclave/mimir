// Barrel — public surface of the trading module.
// Prompt 06 (barrel-exports): module class + public entity types only.
// Internal service, processor, and DTOs are not exported.

export { TradingModule } from './trading.module';
export { PortfolioPerformanceGql } from './entities/portfolio-performance.entity';
export { OrderGql } from './entities/order.entity';
export { MonthlyBudgetGql } from './entities/monthly-budget.entity';
