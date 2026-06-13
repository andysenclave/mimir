import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('AISuggestion')
export class AISuggestionGql {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  body!: string;

  @Field({ description: '"course:<courseId>" or "concept:<conceptId>"' })
  ctaLink!: string;

  // Date → ISO string: code-first reflection can't infer Date fields reliably (see CourseProgress).
  @Field(() => String)
  generatedAt!: string;
}
