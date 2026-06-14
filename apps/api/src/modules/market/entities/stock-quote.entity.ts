import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class StockQuoteGql {
  @Field()
  symbol!: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Float)
  ltp!: number;

  @Field(() => Float, { nullable: true })
  open?: number;

  @Field(() => Float, { nullable: true })
  high?: number;

  @Field(() => Float, { nullable: true })
  low?: number;

  @Field(() => Float, { nullable: true })
  close?: number;

  @Field(() => Float, { nullable: true })
  change?: number;

  @Field(() => Float, { nullable: true })
  changePct?: number;

  @Field(() => Float, { nullable: true })
  volume?: number;

  @Field()
  fetchedAt!: Date;
}
