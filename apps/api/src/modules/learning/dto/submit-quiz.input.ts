import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, IsString, Max, Min, ValidateNested } from 'class-validator';

@InputType()
export class QuizAnswerInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  questionId!: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  @Max(3)
  selectedIndex!: number;
}

@InputType()
export class SubmitQuizInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  quizId!: string;

  @Field(() => [QuizAnswerInput])
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerInput)
  answers!: QuizAnswerInput[];
}
