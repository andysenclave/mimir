import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('Concept')
export class ConceptGql {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  body!: string;

  @Field(() => Int)
  orderIndex!: number;
}
