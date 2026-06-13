// MM-046 — LearningResolver.
// Prompt 24 (resolver discipline): thin — guards, @CurrentUser(), one service call, return.

import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { LocalAuthGuard } from '../auth/auth.guard';

import { AISuggestionsService } from './ai-suggestions.service';
import { CompleteLessonInput } from './dto/complete-lesson.input';
import { SubmitQuizInput } from './dto/submit-quiz.input';
import { AISuggestionGql } from './entities/ai-suggestion.entity';
import { ConceptGql } from './entities/concept.entity';
import { CourseProgressGql } from './entities/course-progress.entity';
import { CourseGql } from './entities/course.entity';
import { AnswerFeedbackGql, QuizGql, QuizResultGql } from './entities/quiz.entity';
import { LearningService } from './learning.service';

@Resolver()
@UseGuards(LocalAuthGuard)
export class LearningResolver {
  constructor(
    private readonly learningService: LearningService,
    private readonly aiSuggestionsService: AISuggestionsService,
  ) {}

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

  @Query(() => [AISuggestionGql], {
    description: 'Portfolio-aware learning suggestions — 2-3 cards, regenerated at most every 24h.',
  })
  aiSuggestions(@CurrentUser() user: AuthUser): Promise<AISuggestionGql[]> {
    return this.aiSuggestionsService.getAISuggestions(user.id);
  }

  @Query(() => QuizGql, { description: 'Quiz for a course. Never exposes correct answers.' })
  quiz(@Args('courseId', { type: () => ID }) courseId: string): Promise<QuizGql> {
    return this.learningService.getQuiz(courseId);
  }

  @Query(() => AnswerFeedbackGql, {
    description: 'Correct answer + explanation for one question, fetched after the user answers.',
  })
  answerFeedback(
    @Args('questionId', { type: () => ID }) questionId: string,
  ): Promise<AnswerFeedbackGql> {
    return this.learningService.getAnswerFeedback(questionId);
  }

  @Mutation(() => QuizResultGql, {
    description: 'Score a quiz server-side. Best score is kept on CourseProgress.',
  })
  submitQuiz(
    @CurrentUser() user: AuthUser,
    @Args('input') input: SubmitQuizInput,
  ): Promise<QuizResultGql> {
    return this.learningService.submitQuiz(user.id, input);
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
