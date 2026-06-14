// MM-006 — code-first GraphQL @ObjectType for the authenticated user.
// Mobile codegen (MM-007) reads the SDL emitted from this and produces a typed
// `AuthUser` for the `me` query.

import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthUser {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field()
  onboardingDone!: boolean;

  /** Consecutive-day app-open streak (MM-077). */
  @Field()
  streakCount!: number;
}
