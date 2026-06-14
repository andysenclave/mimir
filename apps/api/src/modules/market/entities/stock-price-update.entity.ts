import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class StockPriceUpdate {
  @Field()
  symbol!: string;

  @Field(() => Float)
  ltp!: number;

  @Field(() => Float)
  change!: number;

  @Field(() => Float)
  changePct!: number;

  @Field()
  fetchedAt!: string;
}
