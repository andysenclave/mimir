// MM-018 — registerPushDevice mutation.
// MM-040 — NotificationDispatchService + server-side workers.
// MM-041 — notificationPreferences query + updateNotificationPreferences mutation.

import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { ObservabilityModule } from '../../observability/observability.module';
import {
  BudgetNudgeProcessor,
  BUDGET_NUDGE_QUEUE,
} from '../../jobs/budget-nudge.processor';
import {
  PortfolioEventsProcessor,
  PORTFOLIO_EVENTS_QUEUE,
} from '../../jobs/portfolio-events.processor';
import {
  OrderFillNotificationProcessor,
  ORDER_FILL_QUEUE,
} from '../../jobs/order-fill-notification.processor';
import { PriceAlertsProcessor } from '../../jobs/price-alerts.processor';

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
  ],
  exports: [NotificationsService, NotificationDispatchService],
})
export class NotificationsModule {}
