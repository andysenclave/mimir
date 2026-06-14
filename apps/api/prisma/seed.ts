// MM-008 — seed a single test user + active monthly budget so the `me` query
// (MM-006) and downstream trading flows have a known baseline.

/* eslint-disable no-console */
import { PrismaClient, BudgetTier, BudgetStatus } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

const TEST_EMAIL = 'andy@mimir.local';
const TEST_PASSWORD = 'mimir-dev-only';

async function main(): Promise<void> {
  console.info('[seed] starting...');

  const passwordHash = await hash(TEST_PASSWORD, 12);

  const user = await prisma.user.upsert({
    where: { email: TEST_EMAIL },
    update: {},
    create: {
      email: TEST_EMAIL,
      displayName: 'Andy (dev)',
      ageAttested: true,
      termsAccepted: true,
      onboardingDone: true,
      authCredential: {
        create: {
          email: TEST_EMAIL,
          passwordHash,
          emailVerified: true,
        },
      },
      notificationPreferences: {
        create: {},
      },
    },
  });

  // Ensure an ACTIVE budget for the current month exists.
  const cycleStart = new Date();
  cycleStart.setUTCDate(1);
  cycleStart.setUTCHours(0, 0, 0, 0);

  const cycleEnd = new Date(cycleStart);
  cycleEnd.setUTCMonth(cycleEnd.getUTCMonth() + 1);

  await prisma.monthlyBudget.upsert({
    where: {
      // composite-ish: rely on ACTIVE single per user; for seed idempotency we
      // delete first then create.
      id: `seed_${user.id}_${cycleStart.toISOString().slice(0, 7)}`,
    },
    update: {},
    create: {
      id: `seed_${user.id}_${cycleStart.toISOString().slice(0, 7)}`,
      userId: user.id,
      tier: BudgetTier.TIER_50K,
      amount: 50_000,
      cashRemaining: 50_000,
      status: BudgetStatus.ACTIVE,
      cycleStart,
      cycleEnd,
    },
  });

  console.info(`[seed] user ${user.email} ready (id=${user.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
