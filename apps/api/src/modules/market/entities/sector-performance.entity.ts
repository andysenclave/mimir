import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SectorPerformanceGql {
  @Field()
  name!: string;

  @Field()
  displayName!: string;

  @Field(() => Float)
  changePct!: number;
}
