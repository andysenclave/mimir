import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CompleteLessonInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  lessonId!: string;
}
