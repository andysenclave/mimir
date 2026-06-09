// MM-018 — registerPushDevice service. MM-041 — notificationPreferences + updateNotificationPreferences.
// re-registering returns the existing UserDevice. Updates appVersion + lastSeenAt
// on every call so we have fresh fingerprints for stale-token cleanup later.

import { Injectable, Logger } from '@nestjs/common';
import { DevicePlatform as PrismaDevicePlatform } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import type { RegisterPushDeviceInput } from './dto/register-push-device.input';
import type { UserDeviceEntity } from './entities/user-device.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registerPushDevice(
    userId: string,
    input: RegisterPushDeviceInput,
  ): Promise<UserDeviceEntity> {
    const platform = input.platform as PrismaDevicePlatform;

    const existing = await this.prisma.userDevice.findUnique({
      where: { expoPushToken: input.expoPushToken },
    });

    if (existing && existing.userId === userId) {
      // Same user re-registering — refresh metadata.
      const updated = await this.prisma.userDevice.update({
        where: { id: existing.id },
        data: {
          platform,
          ...(input.appVersion !== undefined && { appVersion: input.appVersion }),
          lastSeenAt: new Date(),
        },
      });
      return this.toEntity(updated);
    }

    if (existing && existing.userId !== userId) {
      // Token reassigned to a different user (device handed off?) — reassign
      // and warn so we can audit later.
      this.logger.warn(`push token reassigned from userId=${existing.userId} to userId=${userId}`);
      const updated = await this.prisma.userDevice.update({
        where: { id: existing.id },
        data: {
          userId,
          platform,
          ...(input.appVersion !== undefined && { appVersion: input.appVersion }),
          lastSeenAt: new Date(),
        },
      });
      return this.toEntity(updated);
    }

    const created = await this.prisma.userDevice.create({
      data: {
        userId,
        expoPushToken: input.expoPushToken,
        platform,
        ...(input.appVersion !== undefined && { appVersion: input.appVersion }),
        lastSeenAt: new Date(),
      },
    });
    return this.toEntity(created);
  }

  private toEntity(row: {
    id: string;
    platform: PrismaDevicePlatform;
    createdAt: Date;
  }): UserDeviceEntity {
    return {
      id: row.id,
      platform: row.platform,
      registeredAt: row.createdAt.toISOString(),
    };
  }

  // ─── MM-041 — Notification preferences ────────────────────────────────────

  async getNotificationPreferences(userId: string): Promise<NotificationPrefsRow> {
    const existing = await this.prisma.notificationPreferences.findUnique({
      where: { userId },
    });
    if (existing) return existing;
    // Auto-create with defaults on first access.
    return this.prisma.notificationPreferences.create({ data: { userId } });
  }

  async updateNotificationPreferences(
    userId: string,
    input: NotificationPrefsUpdate,
  ): Promise<NotificationPrefsRow> {
    const { streakEnabled, budgetEnabled, priceAlertsEnabled, portfolioEvtEnabled, educationalEnabled, quietHoursStart, quietHoursEnd, dailyCap } = input;

    return this.prisma.notificationPreferences.upsert({
      where: { userId },
      create: {
        userId,
        ...(streakEnabled !== undefined && { streakEnabled }),
        ...(budgetEnabled !== undefined && { budgetEnabled }),
        ...(priceAlertsEnabled !== undefined && { priceAlertsEnabled }),
        ...(portfolioEvtEnabled !== undefined && { portfolioEvtEnabled }),
        ...(educationalEnabled !== undefined && { educationalEnabled }),
        ...(quietHoursStart !== undefined && { quietHoursStart }),
        ...(quietHoursEnd !== undefined && { quietHoursEnd }),
        ...(dailyCap !== undefined && { dailyCap }),
      },
      update: {
        ...(streakEnabled !== undefined && { streakEnabled }),
        ...(budgetEnabled !== undefined && { budgetEnabled }),
        ...(priceAlertsEnabled !== undefined && { priceAlertsEnabled }),
        ...(portfolioEvtEnabled !== undefined && { portfolioEvtEnabled }),
        ...(educationalEnabled !== undefined && { educationalEnabled }),
        ...(quietHoursStart !== undefined && { quietHoursStart }),
        ...(quietHoursEnd !== undefined && { quietHoursEnd }),
        ...(dailyCap !== undefined && { dailyCap }),
      },
    });
  }
}

// Local type aliases to keep the method signatures readable without needing a
// Prisma import in test mocks (they just need to match the shape).
type NotificationPrefsRow = {
  id: string;
  streakEnabled: boolean;
  budgetEnabled: boolean;
  priceAlertsEnabled: boolean;
  portfolioEvtEnabled: boolean;
  educationalEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  dailyCap: number;
};
type NotificationPrefsUpdate = Partial<Omit<NotificationPrefsRow, 'id'>>;
