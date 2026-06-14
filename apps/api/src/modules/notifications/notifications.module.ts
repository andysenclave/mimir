// MM-018 — registerPushDevice mutation.
// MM-040 — NotificationDispatchService + server-side workers.
// MM-041 — notificationPreferences query + updateNotificationPreferences mutation.

import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import {
  BudgetNudgeProcessor,
  BUDGET_NUDGE_QUEUE,
} from '../../jobs/budget-nudge.processor';
import {
  EducationalTriggersProcessor,
  EDUCATIONAL_TRIGGERS_QUEUE,
} from '../../jobs/educational-triggers.processor';
import {
  OrderFillNotificationProcessor,
  ORDER_FILL_QUEUE,
} from '../../jobs/order-fill-notification.processor';
import {
  PortfolioEventsProcessor,
  PORTFOLIO_EVENTS_QUEUE,
} from '../../jobs/portfolio-events.processor';
import { PriceAlertsProcessor } from '../../jobs/price-alerts.processor';
import { ObservabilityModule } from '../../observability/observability.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

import { NotificationDispatchService } from './notification-dispatch.service';
import { NotificationsResolver } from './notifications.resolver';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    AuthModule,          // for LocalAuthGuard
    PrismaModule,
    ObservabilityModule, // for PostHogService in NotificationDispatchService
    BullModule.registerQueue({ name: BUDGET_NUDGE_QUEUE }),
    BullModule.registerQueue({ name: PORTFOLIO_EVENTS_QUEUE }),
    BullModule.registerQueue({ name: ORDER_FILL_QUEUE }),
    BullModule.registerQueue({ name: EDUCATIONAL_TRIGGERS_QUEUE }),
  ],
  providers: [
    NotificationsService,
    NotificationsResolver,
    NotificationDispatchService,
    // MM-040 workers
    PriceAlertsProcessor,
    BudgetNudgeProcessor,
    PortfolioEventsProcessor,
    OrderFillNotificationProcessor,
    // MM-057 worker
    EducationalTriggersProcessor,
  ],
  exports: [NotificationsService, NotificationDispatchService],
})
export class NotificationsModule {}
