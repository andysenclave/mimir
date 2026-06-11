import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('Lesson')
export class LessonGql {
  @Field(() => ID)
  id!: string;

  @Field()
  courseId!: string;

  @Field()
  title!: string;

  @Field()
  content!: string;

  @Field(() => Int)
  orderIndex!: number;

  @Field(() => Int)
  readTimeMin!: number;

  @Field()
  completed!: boolean;
}
