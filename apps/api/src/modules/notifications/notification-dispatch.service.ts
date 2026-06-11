// MM-040 — Central notification dispatch guard.
// ALL server-side push notifications go through this service — never call Expo SDK directly.
//
// Dispatch flow (CLAUDE.md §10):
//   1. Read NotificationPreferences (per-category toggle).
//   2. TRANSACTIONAL bypasses quiet hours + cap — all others respect both.
//   3. Check quiet hours (default 22:00–07:00 IST).
//   4. Check daily cap (default 2/day, hard ceiling 3/day — tracked in Redis).
//   5. Fetch user devices.
//   6. Call Expo Push API.
//   7. Write NotificationLog.
//   8. Emit PostHog event.

import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotificationCategory } from '@prisma/client';
// expo-server-sdk uses a default export wrapping a class.
// The package is CJS with `module.exports = Expo; module.exports.default = Expo;`
// so we import the namespace and reach the class via .default in strict ESM.
import * as ExpoSdk from 'expo-server-sdk';


import { PostHogService } from '../../observability/posthog.service';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../redis/redis.module';

import type { ExpoPushMessage } from 'expo-server-sdk';
import type { Redis } from 'ioredis';

// Quiet-hours window and daily cap are anchored in IST.
const IST_OFFSET_HOURS = 5.5;
const DEFAULT_QUIET_START = '22:00';
const DEFAULT_QUIET_END = '07:00';
const HARD_DAILY_CAP = 3;

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class NotificationDispatchService {
  private readonly logger = new Logger(NotificationDispatchService.name);
  // expo-server-sdk CJS default export accessed via namespace import.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly expo = new (ExpoSdk as any).default() as ExpoSdk.Expo;

  constructor(
    private readonly prisma: PrismaService,
    private readonly posthog: PostHogService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async dispatch(
    userId: string,
    category: NotificationCategory,
    payload: NotificationPayload,
  ): Promise<void> {
    const isTransactional = category === NotificationCategory.TRANSACTIONAL;

    // 1. Read preferences.
    const prefs = await this.prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    // 2. Per-category toggle (TRANSACTIONAL is always on).
    if (!isTransactional && prefs !== null) {
      const enabled = this.isCategoryEnabled(category, prefs);
      if (!enabled) {
        this.logger.debug(`dispatch skipped — category ${category} disabled for userId=${userId}`);
        this.posthog.capture(userId, 'notification_dropped', { reason: 'pref_disabled', category });
        return;
      }
    }

    // 3. Quiet hours (TRANSACTIONAL skips this check).
    const quietStart = prefs?.quietHoursStart ?? DEFAULT_QUIET_START;
    const quietEnd = prefs?.quietHoursEnd ?? DEFAULT_QUIET_END;
    if (!isTransactional && this.isQuietHours(quietStart, quietEnd)) {
      this.logger.debug(`dispatch skipped — quiet hours (${quietStart}–${quietEnd}) for userId=${userId}`);
      this.posthog.capture(userId, 'notification_dropped', { reason: 'quiet_hours', category });
      return;
    }

    // 4. Daily cap (TRANSACTIONAL skips this check).
    const dailyCap = Math.min(prefs?.dailyCap ?? 2, HARD_DAILY_CAP);
    if (!isTransactional) {
      const capKey = this.capKey(userId);
      const sent = await this.redis.incr(capKey);
      if (sent === 1) {
        // First increment today — set TTL to end of current IST day.
        const secondsUntilMidnightIst = this.secondsUntilIstMidnight();
        await this.redis.expire(capKey, secondsUntilMidnightIst);
      }
      if (sent > dailyCap) {
        // Roll back the increment so repeated calls don't over-count.
        await this.redis.decr(capKey);
        this.logger.debug(`dispatch skipped — daily cap (${dailyCap}) reached for userId=${userId}`);
        this.posthog.capture(userId, 'notification_dropped', { reason: 'cap_exceeded', category });
        return;
      }
    }

    // 5. Fetch push tokens.
    const devices = await this.prisma.userDevice.findMany({
      where: { userId },
      select: { expoPushToken: true },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ExpoClass = (ExpoSdk as any).default as typeof ExpoSdk.Expo;
    const validTokens = devices
      .map((d) => d.expoPushToken)
      .filter((t) => ExpoClass.isExpoPushToken(t));

    if (validTokens.length === 0) {
      this.logger.debug(`dispatch skipped — no valid push tokens for userId=${userId}`);
      return;
    }

    // 6. Send via Expo Push API.
    const messages: ExpoPushMessage[] = validTokens.map((to) => ({
      to,
      title: payload.title,
      body: payload.body,
      data: payload.data,
      sound: 'default',
    }));

    try {
      const chunks = this.expo.chunkPushNotifications(messages);
      for (const chunk of chunks) {
        const receipts = await this.expo.sendPushNotificationsAsync(chunk);
        for (const receipt of receipts) {
          if (receipt.status === 'error') {
            this.logger.warn(`Expo push error: ${receipt.message}`);
          }
        }
      }
    } catch (err) {
      this.logger.error('Expo Push API error', err);
      // Don't rethrow — a failed push must not crash the calling worker.
      return;
    }

    // 7. Audit log.
    try {
      await this.prisma.notificationLog.create({
        data: {
          userId,
          category,
          title: payload.title,
          body: payload.body,
        },
      });
    } catch (err) {
      this.logger.error('Failed to write NotificationLog', err);
    }

    // 8. PostHog event (no PII — CLAUDE.md §19).
    this.posthog.capture(userId, 'notification_sent', { category });
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private isCategoryEnabled(
    category: NotificationCategory,
    prefs: {
      streakEnabled: boolean;
      budgetEnabled: boolean;
      priceAlertsEnabled: boolean;
      portfolioEvtEnabled: boolean;
      educationalEnabled: boolean;
    },
  ): boolean {
    switch (category) {
      case NotificationCategory.STREAK:           return prefs.streakEnabled;
      case NotificationCategory.BUDGET:           return prefs.budgetEnabled;
      case NotificationCategory.PRICE_ALERT:      return prefs.priceAlertsEnabled;
      case NotificationCategory.PORTFOLIO_EVENT:  return prefs.portfolioEvtEnabled;
      case NotificationCategory.EDUCATIONAL:      return prefs.educationalEnabled;
      case NotificationCategory.TRANSACTIONAL:    return true;
    }
  }

  /** Returns true if current IST time falls within the quiet window. */
  private isQuietHours(start: string, end: string): boolean {
    const nowUtc = new Date();
    const nowIstMinutes =
      (nowUtc.getUTCHours() * 60 + nowUtc.getUTCMinutes() + IST_OFFSET_HOURS * 60) % (24 * 60);

    const toMinutes = (hhmm: string): number => {
      const [h = 0, m = 0] = hhmm.split(':').map(Number);
      return h * 60 + m;
    };

    const startMin = toMinutes(start);
    const endMin = toMinutes(end);

    // Handle overnight window (e.g. 22:00 → 07:00).
    if (startMin > endMin) {
      return nowIstMinutes >= startMin || nowIstMinutes < endMin;
    }
    return nowIstMinutes >= startMin && nowIstMinutes < endMin;
  }

  private capKey(userId: string): string {
    // Key resets at IST midnight — TTL enforces this.
    const nowUtc = new Date();
    const istMs = nowUtc.getTime() + IST_OFFSET_HOURS * 60 * 60 * 1000;
    const istDate = new Date(istMs).toISOString().slice(0, 10); // YYYY-MM-DD
    return `notif:cap:${userId}:${istDate}`;
  }

  private secondsUntilIstMidnight(): number {
    const nowUtc = new Date();
    const istMs = nowUtc.getTime() + IST_OFFSET_HOURS * 60 * 60 * 1000;
    const istDate = new Date(istMs);
    // Next IST midnight in UTC.
    const nextMidnightIst = new Date(istDate);
    nextMidnightIst.setUTCHours(0, 0, 0, 0);
    nextMidnightIst.setUTCDate(nextMidnightIst.getUTCDate() + 1);
    const diff = Math.floor((nextMidnightIst.getTime() - nowUtc.getTime()) / 1000);
    return Math.max(diff, 60);
  }
}
