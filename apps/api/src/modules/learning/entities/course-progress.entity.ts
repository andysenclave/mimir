import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('CourseProgress')
export class CourseProgressGql {
  @Field(() => ID)
  id!: string;

  @Field()
  courseId!: string;

  @Field(() => Int)
  lessonsComplete!: number;

  @Field(() => String, { nullable: true })
  completedAt?: string | null;

  @Field(() => Int, { nullable: true, description: 'Best quiz score (percentage 0-100).' })
  quizScore?: number | null;
}
