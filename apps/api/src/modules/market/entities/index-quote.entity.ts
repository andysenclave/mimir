import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class IndexQuoteGql {
  @Field()
  symbol!: string;

  @Field()
  name!: string;

  @Field(() => Float)
  ltp!: number;

  @Field(() => Float)
  change!: number;

  @Field(() => Float)
  changePct!: number;

  @Field()
  fetchedAt!: Date;
}
