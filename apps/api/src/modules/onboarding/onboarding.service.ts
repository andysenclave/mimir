// MM-013 — onboarding service.
// CLAUDE.md §13 + prompt 14: VALIDATE → RESOLVE → EXECUTE → RETURN.
// Idempotent on completeOnboarding — re-calling for an already-onboarded user
// returns the existing active budget instead of creating a second one.

import { BUDGET_TIERS, type BudgetTierId } from '@mimir/shared';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import {
  BudgetStatus as PrismaBudgetStatus,
  BudgetTier as PrismaBudgetTier,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import type { CompleteOnboardingInput } from './dto/complete-onboarding.input';
import type { OnboardingResult } from './entities/onboarding-result.entity';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async completeOnboarding(
    userId: string,
    input: CompleteOnboardingInput,
  ): Promise<OnboardingResult> {
    // VALIDATE — resolve the requested tier amount
    const amount = this.resolveTierAmount(input.budgetTierId, input.customAmount);

    // RESOLVE — locate the user
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ConflictException('User not found');

    // EXECUTE — atomic: flip onboardingDone + create the first ACTIVE
    // MonthlyBudget for the current cycle. Idempotent: if the user already has
    // an ACTIVE budget for this cycle we reuse it.
    const cycleStart = new Date();
    cycleStart.setUTCDate(1);
    cycleStart.setUTCHours(0, 0, 0, 0);
    const cycleEnd = new Date(cycleStart);
    cycleEnd.setUTCMonth(cycleEnd.getUTCMonth() + 1);

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          onboardingDone: true,
          ageAttested: input.ageAttested,
          termsAccepted: input.termsAccepted,
        },
      });

      const existing = await tx.monthlyBudget.findFirst({
        where: { userId, status: PrismaBudgetStatus.ACTIVE },
      });

      const budget =
        existing ??
        (await tx.monthlyBudget.create({
          data: {
            userId,
            tier: input.budgetTierId as PrismaBudgetTier,
            amount,
            cashRemaining: amount,
            status: PrismaBudgetStatus.ACTIVE,
            cycleStart,
            cycleEnd,
          },
        }));

      return { updatedUser, budget };
    });

    if (input.budgetTierId === 'CUSTOM') {
      this.logger.log(`onboarding completed userId=${userId} customAmount=${amount}`);
    } else {
      this.logger.log(`onboarding completed userId=${userId} tier=${input.budgetTierId}`);
    }

    return {
      user: {
        id: result.updatedUser.id,
        email: result.updatedUser.email,
        ...(result.updatedUser.displayName !== null && {
          displayName: result.updatedUser.displayName,
        }),
        onboardingDone: result.updatedUser.onboardingDone,
        streakCount: result.updatedUser.streakCount,
      },
      budget: {
        id: result.budget.id,
        tier: result.budget.tier,
        amount: Number(result.budget.amount),
        cycleStart: result.budget.cycleStart.toISOString(),
        cycleEnd: result.budget.cycleEnd.toISOString(),
      },
    };
  }

  private resolveTierAmount(tierId: BudgetTierId, customAmount: number | undefined): number {
    if (tierId !== 'CUSTOM') return BUDGET_TIERS[tierId].amount;
    if (customAmount === undefined) {
      throw new ConflictException('customAmount is required when budgetTierId is CUSTOM');
    }
    return customAmount;
  }
}
