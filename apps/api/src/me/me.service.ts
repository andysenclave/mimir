// MM-013 — me service. Replaces the MM-006 hardcoded resolver with a real
// Prisma fetch keyed off the @CurrentUser id.

import { BUDGET_TIERS, type BudgetTierId } from '@mimir/shared';
import { Injectable, NotFoundException } from '@nestjs/common';

import { WatchlistLimitException, WatchlistItemNotFoundException } from '../common/exceptions/watchlist.exceptions';
import { PrismaService } from '../prisma/prisma.service';

import type { AuthUser } from './entities/auth-user.entity';
import type { UserProfileGql, WatchlistItemGql } from './entities/profile.entity';

function averageQuizScore(progresses: Array<{ quizScore: number | null }>): number {
  const scores = progresses
    .map((p) => p.quizScore)
    .filter((s): s is number => s !== null);
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
}

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
    const [user, budget, holdings, orders, watchlistRows, courseProgresses] = await Promise.all([
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
      this.prisma.courseProgress.findMany({
        where: { userId },
        select: { completedAt: true, quizScore: true },
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
        coursesDone: courseProgresses.filter((p) => p.completedAt !== null).length,
        // Average of best quiz scores (percentage) across attempted courses; 0 until first attempt.
        quizScore: averageQuizScore(courseProgresses),
      },
      watchlist: watchlistRows.map((w) => ({
        symbol: w.symbol,
        alertEnabled: w.alertEnabled,
        ltp: undefined,
        changePct: undefined,
      })),
    };
  }

  // ─── MM-037 — Watchlist mutations ────────────────────────────────────────────

  /** Add a stock to the user's watchlist. Max 50 entries. Idempotent if already present. */
  async addToWatchlist(userId: string, symbol: string): Promise<WatchlistItemGql> {
    const normalised = symbol.toUpperCase().trim();

    // Check if already present — upsert semantics (idempotent).
    const existing = await this.prisma.watchlist.findUnique({
      where: { userId_symbol: { userId, symbol: normalised } },
    });
    if (existing) {
      return { symbol: existing.symbol, alertEnabled: existing.alertEnabled };
    }

    // Enforce 50-item cap.
    const count = await this.prisma.watchlist.count({ where: { userId } });
    if (count >= 50) throw new WatchlistLimitException();

    const created = await this.prisma.watchlist.create({
      data: { userId, symbol: normalised, alertEnabled: true },
    });
    return { symbol: created.symbol, alertEnabled: created.alertEnabled };
  }

  /** Remove a stock from the user's watchlist. Idempotent if not present. */
  async removeFromWatchlist(userId: string, symbol: string): Promise<boolean> {
    const normalised = symbol.toUpperCase().trim();
    const existing = await this.prisma.watchlist.findUnique({
      where: { userId_symbol: { userId, symbol: normalised } },
    });
    if (!existing) return true; // idempotent — already gone
    await this.prisma.watchlist.delete({
      where: { userId_symbol: { userId, symbol: normalised } },
    });
    return true;
  }

  /** Toggle the price-alert flag for a watchlist item. */
  async toggleWatchlistAlert(
    userId: string,
    symbol: string,
    enabled: boolean,
  ): Promise<WatchlistItemGql> {
    const normalised = symbol.toUpperCase().trim();
    const existing = await this.prisma.watchlist.findUnique({
      where: { userId_symbol: { userId, symbol: normalised } },
    });
    if (!existing) throw new WatchlistItemNotFoundException(normalised);

    const updated = await this.prisma.watchlist.update({
      where: { userId_symbol: { userId, symbol: normalised } },
      data: { alertEnabled: enabled },
    });
    return { symbol: updated.symbol, alertEnabled: updated.alertEnabled };
  }
}
