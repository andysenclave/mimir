// MM-054/055 — quiz GraphQL types.
// SECURITY: correctIndex and explanation are intentionally absent from QuizQuestionGql —
// scoring is server-side only. They surface solely through AnswerFeedbackGql after the
// user has selected an option.

import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('QuizQuestion')
export class QuizQuestionGql {
  @Field(() => ID)
  id!: string;

  @Field()
  question!: string;

  @Field(() => [String])
  options!: string[];

  @Field(() => Int)
  orderIndex!: number;
}

@ObjectType('Quiz')
export class QuizGql {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  courseId!: string;

  @Field()
  title!: string;

  @Field({ description: 'Course title, for the quiz screen header.' })
  courseTitle!: string;

  @Field(() => [QuizQuestionGql])
  questions!: QuizQuestionGql[];
}

@ObjectType('AnswerFeedback')
export class AnswerFeedbackGql {
  @Field(() => ID)
  questionId!: string;

  @Field(() => Int)
  correctIndex!: number;

  @Field()
  explanation!: string;
}

@ObjectType('QuizResult')
export class QuizResultGql {
  @Field(() => Int, { description: 'Percentage score 0-100.' })
  score!: number;

  @Field(() => Int)
  total!: number;

  @Field(() => Int, { description: 'Number of correctly answered questions.' })
  correct!: number;

  @Field(() => ID)
  attemptId!: string;
}
