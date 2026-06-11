// MM-046 — LearningService.
// Owns all learning domain business logic.
// Prompt 14 (service-method): service owns logic; resolver calls, returns.

import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CompleteLessonInput } from './dto/complete-lesson.input';

import type { ConceptGql } from './entities/concept.entity';
import type { CourseProgressGql } from './entities/course-progress.entity';
import type { CourseGql } from './entities/course.entity';

const IST_OFFSET_HOURS = 5.5;

function serializeProgress(p: {
  id: string;
  courseId: string;
  lessonsComplete: number;
  completedAt: Date | null;
}): CourseProgressGql {
  return {
    id: p.id,
    courseId: p.courseId,
    lessonsComplete: p.lessonsComplete,
    completedAt: p.completedAt?.toISOString() ?? null,
  };
}

@Injectable()
export class LearningService {
  constructor(private readonly prisma: PrismaService) {}

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

  private getDayOfYear(date: Date): number {
    const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}
