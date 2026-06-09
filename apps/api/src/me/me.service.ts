// MM-013 — me service. Replaces the MM-006 hardcoded resolver with a real
// Prisma fetch keyed off the @CurrentUser id.

import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { BUDGET_TIERS, type BudgetTierId } from '@mimir/shared';
import type { AuthUser } from './entities/auth-user.entity';
import type { UserProfileGql } from './entities/profile.entity';

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, displayName: true, onboardingDone: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      email: user.email,
      ...(user.displayName !== null && { displayName: user.displayName }),
      onboardingDone: user.onboardingDone,
    };
  }

  /** MM-036 — aggregated profile data for the Profile tab. */
  async getProfile(userId: string): Promise<UserProfileGql> {
    const [user, budget, holdings, orders, watchlistRows] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, displayName: true, createdAt: true },
      }),
      this.prisma.monthlyBudget.findFirst({
        where: { userId, status: 'ACTIVE' },
        select: { cashRemaining: true, tier: true },
      }),
      this.prisma.holding.findMany({
        where: { userId },
        select: { quantity: true, avgBuyPrice: true },
      }),
      this.prisma.order.findMany({
        where: { userId, status: 'FILLED', type: 'SELL' },
        select: { realizedPnl: true },
      }),
      this.prisma.watchlist.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        take: 3,
        select: { symbol: true, alertEnabled: true },
      }),
    ]);

    if (!user) throw new NotFoundException('User not found');

    // Total return = sum of realized P&L from sells + unrealized P&L from current holdings.
    // Unrealized P&L requires live LTP — omitted here; resolver can enrich via MarketService.
    const realizedPnl = orders.reduce(
      (sum, o) => sum + (o.realizedPnl?.toNumber() ?? 0),
      0,
    );
    const totalInvested = holdings.reduce(
      (sum, h) => sum + h.quantity * h.avgBuyPrice.toNumber(),
      0,
    );
    const totalReturnPct = totalInvested > 0 ? (realizedPnl / totalInvested) * 100 : 0;

    const tierId = (budget?.tier ?? 'TIER_50K') as BudgetTierId;
    const tierLabel = BUDGET_TIERS[tierId]?.label ?? '—';

    return {
      id: user.id,
      email: user.email,
      ...(user.displayName !== null ? { displayName: user.displayName } : {}),
      memberSince: user.createdAt.getTime(),
      stats: {
        totalReturnInr: realizedPnl,
        totalReturnPct,
        budgetTierLabel: tierLabel,
        cashRemaining: budget?.cashRemaining.toNumber() ?? 0,
        coursesDone: 0,   // Phase 2
        quizScore: 0,     // Phase 2
      },
      watchlist: watchlistRows.map((w) => ({
        symbol: w.symbol,
        alertEnabled: w.alertEnabled,
        ltp: undefined,
        changePct: undefined,
      })),
    };
  }
}
