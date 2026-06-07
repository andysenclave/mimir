// TradingModule — MM-025 stub.
// Full module (orders, budget, holdings mutations) lands in MM-026.
// Imports MarketModule to inject MarketDataProvider for portfolio performance.

import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { MarketModule } from '../market/market.module';

import { TradingResolver } from './trading.resolver';
import { TradingService } from './trading.service';

@Module({
  imports: [PrismaModule, MarketModule],
  providers: [TradingService, TradingResolver],
  exports: [TradingService],
})
export class TradingModule {}
