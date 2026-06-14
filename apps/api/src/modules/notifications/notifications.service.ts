// MM-018 — registerPushDevice service. Idempotent on (userId, expoPushToken):
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
}
