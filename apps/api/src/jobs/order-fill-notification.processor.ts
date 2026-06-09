// MM-040 — Order-fill transactional notification worker.
// Triggered by the ORDER_FILL_QUEUE (enqueued by TradingService after a successful BUY or SELL).
// TRANSACTIONAL category — bypasses quiet hours and daily cap. (CLAUDE.md §10)

import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { NotificationCategory } from '@prisma/client';
import type { Job } from 'bullmq';

import { NotificationDispatchService } from '../modules/notifications/notification-dispatch.service';
import { orderFillTemplate } from '../modules/notifications/templates/order-fill';

export const ORDER_FILL_QUEUE = 'order-fill-notification';
export const ORDER_FILL_JOB = 'send-order-fill-notification';

export interface OrderFillJobData {
  userId: string;
  symbol: string;
  orderType: 'BUY' | 'SELL';
  quantity: number;
  priceAtExecution: number;
}

@Processor(ORDER_FILL_QUEUE, { concurrency: 5 })
export class OrderFillNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderFillNotificationProcessor.name);

  constructor(private readonly dispatch: NotificationDispatchService) {
    super();
  }

  async process(job: Job<OrderFillJobData>): Promise<void> {
    const { userId, symbol, orderType, quantity, priceAtExecution } = job.data;
    const payload = orderFillTemplate({ symbol, orderType, quantity, priceAtExecution });
    await this.dispatch.dispatch(userId, NotificationCategory.TRANSACTIONAL, payload);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error): void {
    this.logger.error(`order-fill-notification job ${job.id} failed: ${err.message}`);
  }
}
