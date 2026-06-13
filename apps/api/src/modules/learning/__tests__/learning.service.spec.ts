// Unit tests for LearningService.submitQuiz — MM-055.
// Prompt 08 (how-to-unit-test-a-service): mock all deps, one behaviour per test.
//
// Coverage (the scoring invariants that matter):
//   - Score is computed server-side from correctIndex, not trusted from the client.
//   - CourseProgress keeps the BEST score across attempts (highest wins).
//   - Retakes always create a new attempt and increment the attempt count.
//   - PostHog 'quiz_completed' fires with courseId/score/total/attemptNumber.
//   - Incomplete answer sets are rejected (BadRequestException).

import { BadRequestException, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { PostHogService } from '../../../observability/posthog.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { LearningService } from '../learning.service';

import type { SubmitQuizInput } from '../dto/submit-quiz.input';

const USER_ID = 'user_test_001';
const QUIZ_ID = 'quiz_test_001';
const COURSE_ID = 'course_test_001';

// Three questions; correct answers are indices 1, 2, 0.
function makeQuizWithQuestions() {
  return {
    id: QUIZ_ID,
    courseId: COURSE_ID,
    title: 'Test Quiz',
    questions: [
      { id: 'q1', correctIndex: 1 },
      { id: 'q2', correctIndex: 2 },
      { id: 'q3', correctIndex: 0 },
    ],
  };
}

function makeInput(answers: Array<[string, number]>): SubmitQuizInput {
  return {
    quizId: QUIZ_ID,
    answers: answers.map(([questionId, selectedIndex]) => ({ questionId, selectedIndex })),
  };
}

const mockPrisma = {
  quiz: { findUnique: jest.fn() },
  quizAttempt: { create: jest.fn(), count: jest.fn() },
  courseProgress: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  $transaction: jest.fn(),
};

const mockPostHog = { capture: jest.fn() };

describe('LearningService.submitQuiz', () => {
  let service: LearningService;

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.spyOn(Logger.prototype, 'warn').mockReturnValue(undefined);

    const module = await Test.createTestingModule({
      providers: [
        LearningService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PostHogService, useValue: mockPostHog },
      ],
    }).compile();

    service = module.get(LearningService);

    // Run the transaction callback against a tx that delegates to the mocked client.
    mockPrisma.$transaction.mockImplementation(async (cb: (tx: typeof mockPrisma) => unknown) =>
      cb(mockPrisma),
    );
  });

  it('computes the score server-side from correctIndex', async () => {
    mockPrisma.quiz.findUnique.mockResolvedValue(makeQuizWithQuestions());
    mockPrisma.quizAttempt.create.mockResolvedValue({ id: 'attempt_1' });
    mockPrisma.quizAttempt.count.mockResolvedValue(1);
    mockPrisma.courseProgress.findUnique.mockResolvedValue(null);
    mockPrisma.courseProgress.create.mockResolvedValue({});

    // 2 of 3 correct (q1✓, q2✓, q3✗) → round(2/3*100) = 67.
    const result = await service.submitQuiz(USER_ID, makeInput([
      ['q1', 1],
      ['q2', 2],
      ['q3', 3],
    ]));

    expect(result.correct).toBe(2);
    expect(result.total).toBe(3);
    expect(result.score).toBe(67);
    expect(result.attemptId).toBe('attempt_1');
  });

  it('persists a perfect score of 100', async () => {
    mockPrisma.quiz.findUnique.mockResolvedValue(makeQuizWithQuestions());
    mockPrisma.quizAttempt.create.mockResolvedValue({ id: 'attempt_2' });
    mockPrisma.quizAttempt.count.mockResolvedValue(1);
    mockPrisma.courseProgress.findUnique.mockResolvedValue(null);
    mockPrisma.courseProgress.create.mockResolvedValue({});

    const result = await service.submitQuiz(USER_ID, makeInput([
      ['q1', 1],
      ['q2', 2],
      ['q3', 0],
    ]));

    expect(result.score).toBe(100);
    expect(result.correct).toBe(3);
    expect(mockPrisma.courseProgress.create).toHaveBeenCalledWith({
      data: { userId: USER_ID, courseId: COURSE_ID, quizScore: 100 },
    });
  });

  it('keeps the best score — does NOT lower an existing higher score on a worse retake', async () => {
    mockPrisma.quiz.findUnique.mockResolvedValue(makeQuizWithQuestions());
    mockPrisma.quizAttempt.create.mockResolvedValue({ id: 'attempt_3' });
    mockPrisma.quizAttempt.count.mockResolvedValue(2);
    mockPrisma.courseProgress.findUnique.mockResolvedValue({ quizScore: 100 });

    // Worse attempt: 1 of 3 → 33.
    const result = await service.submitQuiz(USER_ID, makeInput([
      ['q1', 1],
      ['q2', 0],
      ['q3', 3],
    ]));

    expect(result.score).toBe(33);
    expect(mockPrisma.courseProgress.update).not.toHaveBeenCalled();
  });

  it('raises the stored score when a retake beats the previous best', async () => {
    mockPrisma.quiz.findUnique.mockResolvedValue(makeQuizWithQuestions());
    mockPrisma.quizAttempt.create.mockResolvedValue({ id: 'attempt_4' });
    mockPrisma.quizAttempt.count.mockResolvedValue(2);
    mockPrisma.courseProgress.findUnique.mockResolvedValue({ quizScore: 33 });

    // Better attempt: 3 of 3 → 100.
    await service.submitQuiz(USER_ID, makeInput([
      ['q1', 1],
      ['q2', 2],
      ['q3', 0],
    ]));

    expect(mockPrisma.courseProgress.update).toHaveBeenCalledWith({
      where: { userId_courseId: { userId: USER_ID, courseId: COURSE_ID } },
      data: { quizScore: 100 },
    });
  });

  it('emits quiz_completed with the attempt number', async () => {
    mockPrisma.quiz.findUnique.mockResolvedValue(makeQuizWithQuestions());
    mockPrisma.quizAttempt.create.mockResolvedValue({ id: 'attempt_5' });
    mockPrisma.quizAttempt.count.mockResolvedValue(3);
    mockPrisma.courseProgress.findUnique.mockResolvedValue({ quizScore: 100 });

    await service.submitQuiz(USER_ID, makeInput([
      ['q1', 1],
      ['q2', 2],
      ['q3', 0],
    ]));

    expect(mockPostHog.capture).toHaveBeenCalledWith(USER_ID, 'quiz_completed', {
      courseId: COURSE_ID,
      score: 100,
      total: 3,
      attemptNumber: 3,
    });
  });

  it('rejects an answer set that does not cover every question', async () => {
    mockPrisma.quiz.findUnique.mockResolvedValue(makeQuizWithQuestions());

    await expect(
      service.submitQuiz(USER_ID, makeInput([
        ['q1', 1],
        ['q2', 2],
      ])),
    ).rejects.toThrow(BadRequestException);

    expect(mockPrisma.quizAttempt.create).not.toHaveBeenCalled();
  });
});
