import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { NotificationsResolver } from './notifications.resolver';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [AuthModule], // for LocalAuthGuard
  providers: [NotificationsService, NotificationsResolver],
  exports: [NotificationsService],
})
export class NotificationsModule {}
