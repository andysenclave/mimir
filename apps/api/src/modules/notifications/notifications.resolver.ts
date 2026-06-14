// MM-018 — registerPushDevice mutation. Behind LocalAuthGuard.

import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { LocalAuthGuard } from '../auth/auth.guard';

import { RegisterPushDeviceInput } from './dto/register-push-device.input';
import { UserDeviceEntity } from './entities/user-device.entity';
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
}
