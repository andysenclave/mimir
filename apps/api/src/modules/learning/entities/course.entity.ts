import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

import { CourseProgressGql } from './course-progress.entity';
import { LessonGql } from './lesson.entity';

@ObjectType('Course')
export class CourseGql {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field()
  difficulty!: string;

  @Field(() => Int)
  totalTimeMin!: number;

  @Field(() => Int)
  orderIndex!: number;

  @Field(() => [LessonGql])
  lessons!: LessonGql[];

  @Field(() => CourseProgressGql, { nullable: true })
  progress?: CourseProgressGql | null;
}
