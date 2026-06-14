import { Field, ObjectType } from '@nestjs/graphql';

import { IndexQuoteGql } from './index-quote.entity';
import { SectorPerformanceGql } from './sector-performance.entity';
import { StockQuoteGql } from './stock-quote.entity';

@ObjectType()
export class MarketOverviewGql {
  @Field(() => [IndexQuoteGql])
  indices!: IndexQuoteGql[];

  @Field(() => [IndexQuoteGql], { description: 'Global indices (S&P 500, NASDAQ).' })
  globalIndices!: IndexQuoteGql[];

  @Field(() => [StockQuoteGql])
  topGainers!: StockQuoteGql[];

  @Field(() => [StockQuoteGql])
  topLosers!: StockQuoteGql[];

  @Field(() => [SectorPerformanceGql])
  sectors!: SectorPerformanceGql[];

  @Field()
  fetchedAt!: Date;
}
