// Unit tests for EducationalTriggersProcessor — MM-057.
// Prompt 08 (how-to-unit-test-a-service): mock all deps, one behaviour per test.
//
// Focus: the end-to-end matching + throttle behaviour that decides whether a user
// gets an educational nudge — the riskiest logic in the worker.

import { Logger } from '@nestjs/common';
import { NotificationCategory, Prisma } from '@prisma/client';

import { NotificationDispatchService } from '../../modules/notifications/notification-dispatch.service';
import { EDUCATIONAL_TRIGGERS_QUEUE, EducationalTriggersProcessor } from '../educational-triggers.processor';

const USER_ID = 'user_1';

// A concept tagged PRICE_DROP @ 8% that belongs to course_1's lesson.
function bearConcept() {
  return {
    id: 'concept_bear',
    title: 'Bear market',
    triggerKind: 'PRICE_DROP',
    triggerThreshold: 8,
    lesson: { courseId: 'course_1' },
  };
}

function snapshot(symbol: string, changePct: number) {
  return { symbol, changePct: new Prisma.Decimal(changePct) };
}

const mockPrisma = {
  concept: { findMany: jest.fn() },
  marketSnapshot: { findMany: jest.fn() },
  courseProgress: { findMany: jest.fn() },
  holding: { findMany: jest.fn() },
};

const mockDispatch = { dispatch: jest.fn() };
const mockRedis = { set: jest.fn() };
const mockQueue = { add: jest.fn() };

function makeProcessor(): EducationalTriggersProcessor {
  return new EducationalTriggersProcessor(
    mockPrisma as unknown as never,
    mockDispatch as unknown as NotificationDispatchService,
    mockRedis as unknown as never,
    mockQueue as unknown as never,
  );
}

describe('EducationalTriggersProcessor.process', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(Logger.prototype, 'log').mockReturnValue(undefined);
    // Default: a completed course_1 user holding RELIANCE, bear concept tagged.
    mockPrisma.concept.findMany.mockResolvedValue([bearConcept()]);
    mockPrisma.courseProgress.findMany
      .mockResolvedValueOnce([{ id: 'cp1', userId: USER_ID, courseId: 'course_1' }])
      .mockResolvedValueOnce([]);
    mockPrisma.holding.findMany.mockResolvedValue([{ symbol: 'RELIANCE' }]);
    mockRedis.set.mockResolvedValue('OK'); // weekly slot free
  });

  it('dispatches a nudge when a held stock clears the drop threshold', async () => {
    mockPrisma.marketSnapshot.findMany.mockResolvedValue([snapshot('RELIANCE', -9)]); // -9% < -8%

    const result = await makeProcessor().process({} as never);

    expect(result.dispatched).toBe(1);
    expect(mockDispatch.dispatch).toHaveBeenCalledWith(
      USER_ID,
      NotificationCategory.EDUCATIONAL,
      expect.objectContaining({ data: expect.objectContaining({ conceptId: 'concept_bear' }) }),
    );
  });

  it('does not dispatch when the move is below threshold', async () => {
    mockPrisma.marketSnapshot.findMany.mockResolvedValue([snapshot('RELIANCE', -3)]); // -3% > -8%

    const result = await makeProcessor().process({} as never);

    expect(result.dispatched).toBe(0);
    expect(mockDispatch.dispatch).not.toHaveBeenCalled();
  });

  it('respects the weekly throttle — no dispatch when the slot is already claimed', async () => {
    mockPrisma.marketSnapshot.findMany.mockResolvedValue([snapshot('RELIANCE', -12)]);
    mockRedis.set.mockResolvedValue(null); // NX failed — already nudged this week

    const result = await makeProcessor().process({} as never);

    expect(result.dispatched).toBe(0);
    expect(mockDispatch.dispatch).not.toHaveBeenCalled();
  });

  it('does not nudge about a concept from a course the user has not completed', async () => {
    // User completed course_2, but the bear concept belongs to course_1.
    mockPrisma.courseProgress.findMany.mockReset();
    mockPrisma.courseProgress.findMany
      .mockResolvedValueOnce([{ id: 'cp1', userId: USER_ID, courseId: 'course_2' }])
      .mockResolvedValueOnce([]);
    mockPrisma.marketSnapshot.findMany.mockResolvedValue([snapshot('RELIANCE', -15)]);

    const result = await makeProcessor().process({} as never);

    expect(result.dispatched).toBe(0);
  });

  it('short-circuits when there are no tagged concepts', async () => {
    mockPrisma.concept.findMany.mockResolvedValue([]);

    const result = await makeProcessor().process({} as never);

    expect(result.dispatched).toBe(0);
    expect(mockPrisma.courseProgress.findMany).not.toHaveBeenCalled();
  });
});

describe('EducationalTriggersProcessor.onModuleInit', () => {
  beforeEach(() => jest.resetAllMocks());

  it('registers the daily IST cron (idempotent by name+pattern)', async () => {
    mockQueue.add.mockResolvedValue(undefined);
    jest.spyOn(Logger.prototype, 'log').mockReturnValue(undefined);

    await makeProcessor().onModuleInit();

    expect(mockQueue.add).toHaveBeenCalledWith(
      expect.any(String),
      {},
      expect.objectContaining({
        repeat: expect.objectContaining({ pattern: '30 9 * * *', tz: 'Asia/Kolkata' }),
      }),
    );
  });
});

// Guard against the queue-name constant drifting from the module registration.
it('exports a stable queue name', () => {
  expect(EDUCATIONAL_TRIGGERS_QUEUE).toBe('educational-triggers');
});
