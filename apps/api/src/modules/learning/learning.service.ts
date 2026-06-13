// MM-046 — LearningService.
// Owns all learning domain business logic.
// Prompt 14 (service-method): service owns logic; resolver calls, returns.

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PostHogService } from '../../observability/posthog.service';
import { PrismaService } from '../../prisma/prisma.service';

import { CompleteLessonInput } from './dto/complete-lesson.input';
import { SubmitQuizInput } from './dto/submit-quiz.input';

import type { ConceptGql } from './entities/concept.entity';
import type { CourseProgressGql } from './entities/course-progress.entity';
import type { CourseGql } from './entities/course.entity';
import type { AnswerFeedbackGql, QuizGql, QuizResultGql } from './entities/quiz.entity';

const IST_OFFSET_HOURS = 5.5;

function serializeProgress(p: {
  id: string;
  courseId: string;
  lessonsComplete: number;
  completedAt: Date | null;
  quizScore: number | null;
}): CourseProgressGql {
  return {
    id: p.id,
    courseId: p.courseId,
    lessonsComplete: p.lessonsComplete,
    completedAt: p.completedAt?.toISOString() ?? null,
    quizScore: p.quizScore,
  };
}

@Injectable()
export class LearningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly posthog: PostHogService,
  ) {}

  async getCourses(userId: string): Promise<CourseGql[]> {
    const courses = await this.prisma.course.findMany({
      include: { lessons: { orderBy: { orderIndex: 'asc' } } },
      orderBy: { orderIndex: 'asc' },
    });

    const progresses = await this.prisma.courseProgress.findMany({
      where: { userId },
    });
    const progressMap = new Map(progresses.map((p) => [p.courseId, p]));

    return courses.map((course) => {
      const progress = progressMap.get(course.id) ?? null;
      return {
        ...course,
        lessons: course.lessons.map((l) => ({
          ...l,
          completed:
            progress !== null && progress.lessonId !== null
              ? course.lessons
                  .filter((ll) => ll.orderIndex <= l.orderIndex)
                  .some((ll) => ll.id === progress.lessonId)
              : false,
        })),
        progress: progress !== null ? serializeProgress(progress) : null,
      };
    });
  }

  async getCourse(userId: string, courseId: string): Promise<CourseGql> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { lessons: { orderBy: { orderIndex: 'asc' } } },
    });
    if (course === null) throw new NotFoundException(`Course ${courseId} not found`);

    const progress = await this.prisma.courseProgress.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    // A lesson is completed if its orderIndex <= the last completed lesson's orderIndex.
    const lastCompletedLesson =
      progress?.lessonId !== undefined && progress?.lessonId !== null
        ? course.lessons.find((l) => l.id === progress.lessonId)
        : null;
    const lastCompletedIndex = lastCompletedLesson?.orderIndex ?? -1;

    return {
      ...course,
      lessons: course.lessons.map((l) => ({
        ...l,
        completed: l.orderIndex <= lastCompletedIndex,
      })),
      progress: progress !== null ? serializeProgress(progress) : null,
    };
  }

  async completeLesson(userId: string, input: CompleteLessonInput): Promise<CourseProgressGql> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: input.lessonId },
      include: { course: { include: { lessons: true } } },
    });
    if (lesson === null) throw new NotFoundException(`Lesson ${input.lessonId} not found`);

    const totalLessons = lesson.course.lessons.length;

    const existing = await this.prisma.courseProgress.findUnique({
      where: { userId_courseId: { userId, courseId: lesson.courseId } },
    });

    // Idempotent: if this lesson is already the last completed (or further), return unchanged.
    if (existing !== null && existing.lessonId !== null) {
      const existingLesson = lesson.course.lessons.find((l) => l.id === existing.lessonId);
      if (
        existingLesson !== null &&
        existingLesson !== undefined &&
        existingLesson.orderIndex >= lesson.orderIndex
      ) {
        return serializeProgress(existing);
      }
    }

    // Count completed lessons (all with orderIndex <= this lesson's orderIndex).
    const lessonsComplete = lesson.course.lessons.filter(
      (l) => l.orderIndex <= lesson.orderIndex,
    ).length;

    const completedAt =
      lessonsComplete >= totalLessons ? new Date() : (existing?.completedAt ?? null);

    const progress = await this.prisma.courseProgress.upsert({
      where: { userId_courseId: { userId, courseId: lesson.courseId } },
      update: { lessonId: input.lessonId, lessonsComplete, completedAt },
      create: {
        userId,
        courseId: lesson.courseId,
        lessonId: input.lessonId,
        lessonsComplete,
        completedAt,
      },
    });

    return serializeProgress(progress);
  }

  async getTodaysConcept(): Promise<ConceptGql> {
    // Deterministic daily rotation: same concept for all users on the same IST day.
    const nowUtc = new Date();
    const istMs = nowUtc.getTime() + IST_OFFSET_HOURS * 60 * 60 * 1000;
    const istDate = new Date(istMs);
    const dayOfYear = this.getDayOfYear(istDate);
    const orderIndex = (dayOfYear % 30) + 1; // 1–30

    const concept = await this.prisma.concept.findUnique({ where: { orderIndex } });
    if (concept === null) {
      const fallback = await this.prisma.concept.findFirst({ orderBy: { orderIndex: 'asc' } });
      if (fallback === null) throw new NotFoundException('No concepts seeded');
      return { id: fallback.id, title: fallback.title, body: fallback.body, orderIndex: fallback.orderIndex };
    }

    return { id: concept.id, title: concept.title, body: concept.body, orderIndex: concept.orderIndex };
  }

  // ─── MM-054/055 — Quiz ───────────────────────────────────────────────────

  /** Quiz for a course, questions ordered. correctIndex/explanation never leave the server. */
  async getQuiz(courseId: string): Promise<QuizGql> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { courseId },
      include: {
        course: { select: { title: true } },
        questions: { orderBy: { orderIndex: 'asc' } },
      },
    });
    if (quiz === null) throw new NotFoundException(`No quiz for course ${courseId}`);

    return {
      id: quiz.id,
      courseId: quiz.courseId,
      title: quiz.title,
      courseTitle: quiz.course.title,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options as string[],
        orderIndex: q.orderIndex,
      })),
    };
  }

  /** Per-question feedback, fetched by mobile after the user selects an option. */
  async getAnswerFeedback(questionId: string): Promise<AnswerFeedbackGql> {
    const question = await this.prisma.quizQuestion.findUnique({
      where: { id: questionId },
      select: { id: true, correctIndex: true, explanation: true },
    });
    if (question === null) throw new NotFoundException(`Question ${questionId} not found`);

    return {
      questionId: question.id,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
    };
  }

  /**
   * Score a completed quiz server-side, persist the attempt, and keep the best
   * score (percentage) on CourseProgress. Retakes always create a new attempt;
   * the progress score only moves up.
   */
  async submitQuiz(userId: string, input: SubmitQuizInput): Promise<QuizResultGql> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: input.quizId },
      include: { questions: { select: { id: true, correctIndex: true } } },
    });
    if (quiz === null) throw new NotFoundException(`Quiz ${input.quizId} not found`);

    const total = quiz.questions.length;
    const answerMap = new Map(input.answers.map((a) => [a.questionId, a.selectedIndex]));
    if (answerMap.size !== total || quiz.questions.some((q) => !answerMap.has(q.id))) {
      throw new BadRequestException('Answers must cover every question exactly once');
    }

    const correct = quiz.questions.filter((q) => answerMap.get(q.id) === q.correctIndex).length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    const [attempt, attemptNumber] = await this.prisma.$transaction(async (tx) => {
      const created = await tx.quizAttempt.create({
        data: {
          userId,
          quizId: quiz.id,
          score,
          total,
          answers: input.answers.map((a) => ({
            questionId: a.questionId,
            selectedIndex: a.selectedIndex,
          })),
        },
      });

      const count = await tx.quizAttempt.count({ where: { userId, quizId: quiz.id } });

      // Highest score wins. upsert covers the (unusual) case of no progress row.
      const progress = await tx.courseProgress.findUnique({
        where: { userId_courseId: { userId, courseId: quiz.courseId } },
      });
      if (progress === null) {
        await tx.courseProgress.create({
          data: { userId, courseId: quiz.courseId, quizScore: score },
        });
      } else if (progress.quizScore === null || score > progress.quizScore) {
        await tx.courseProgress.update({
          where: { userId_courseId: { userId, courseId: quiz.courseId } },
          data: { quizScore: score },
        });
      }

      return [created, count] as const;
    });

    this.posthog.capture(userId, 'quiz_completed', {
      courseId: quiz.courseId,
      score,
      total,
      attemptNumber,
    });

    return { score, total, correct, attemptId: attempt.id };
  }

  private getDayOfYear(date: Date): number {
    const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}
