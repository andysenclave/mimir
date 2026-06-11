// MM-046 — LearningResolver.
// Prompt 24 (resolver discipline): thin — guards, @CurrentUser(), one service call, return.

import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { LocalAuthGuard } from '../auth/auth.guard';

import { CompleteLessonInput } from './dto/complete-lesson.input';
import { ConceptGql } from './entities/concept.entity';
import { CourseProgressGql } from './entities/course-progress.entity';
import { CourseGql } from './entities/course.entity';
import { LearningService } from './learning.service';

@Resolver()
@UseGuards(LocalAuthGuard)
export class LearningResolver {
  constructor(private readonly learningService: LearningService) {}

  @Query(() => [CourseGql], { description: 'All courses with user progress.' })
  courses(@CurrentUser() user: AuthUser): Promise<CourseGql[]> {
    return this.learningService.getCourses(user.id);
  }

  @Query(() => CourseGql, { description: 'Single course with lessons and user progress.' })
  course(
    @CurrentUser() user: AuthUser,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<CourseGql> {
    return this.learningService.getCourse(user.id, id);
  }

  @Query(() => ConceptGql, { description: "Today's concept — deterministic daily rotation." })
  todaysConcept(): Promise<ConceptGql> {
    return this.learningService.getTodaysConcept();
  }

  @Mutation(() => CourseProgressGql, {
    description: 'Mark a lesson as complete. Idempotent — re-calling has no effect.',
  })
  completeLesson(
    @CurrentUser() user: AuthUser,
    @Args('input') input: CompleteLessonInput,
  ): Promise<CourseProgressGql> {
    return this.learningService.completeLesson(user.id, input);
  }
}
