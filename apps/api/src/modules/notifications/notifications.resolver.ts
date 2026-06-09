// MM-018 — registerPushDevice mutation.
// MM-041 — notificationPreferences query + updateNotificationPreferences mutation.
// All behind LocalAuthGuard.

import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { LocalAuthGuard } from '../auth/auth.guard';

import { RegisterPushDeviceInput } from './dto/register-push-device.input';
import { UpdateNotificationPreferencesInput } from './dto/update-notification-preferences.input';
import { UserDeviceEntity } from './entities/user-device.entity';
import { NotificationPreferencesGql } from './entities/notification-preferences.entity';
import { NotificationsService } from './notifications.service';

@Resolver(() => UserDeviceEntity)
@UseGuards(LocalAuthGuard)
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Mutation(() => UserDeviceEntity, {
    description:
      'Register an Expo push token for the authenticated user. Idempotent on (userId, expoPushToken).',
  })
  registerPushDevice(
    @CurrentUser() user: AuthUser | null,
    @Args('input') input: RegisterPushDeviceInput,
  ): Promise<UserDeviceEntity> {
    if (user === null) throw new Error('User context missing despite LocalAuthGuard');
    return this.notificationsService.registerPushDevice(user.id, input);
  }

  // ─── MM-041 ────────────────────────────────────────────────────────────────

  @Query(() => NotificationPreferencesGql, {
    description:
      'Read the authenticated user\'s notification preferences. ' +
      'Auto-created with defaults if the user has never saved preferences.',
  })
  notificationPreferences(
    @CurrentUser() user: AuthUser | null,
  ): Promise<NotificationPreferencesGql> {
    if (user === null) throw new Error('User context missing despite LocalAuthGuard');
    return this.notificationsService.getNotificationPreferences(user.id);
  }

  @Mutation(() => NotificationPreferencesGql, {
    description:
      'Update the authenticated user\'s notification preferences. ' +
      'Partial update — only provided fields are changed. ' +
      'TRANSACTIONAL notifications cannot be disabled.',
  })
  updateNotificationPreferences(
    @CurrentUser() user: AuthUser | null,
    @Args('input') input: UpdateNotificationPreferencesInput,
  ): Promise<NotificationPreferencesGql> {
    if (user === null) throw new Error('User context missing despite LocalAuthGuard');
    return this.notificationsService.updateNotificationPreferences(user.id, input);
  }
}
