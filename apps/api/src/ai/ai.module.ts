// MM-032 — AI module.
// Prompt 10 (how-to-scaffold-a-new-module.md): module owns its providers + queue.
// AIService is exported so jobs/ai-precompute-cron.processor.ts can consume it.

import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { AI_PRECOMPUTE_QUEUE , AIPrecomputeCronProcessor } from '../jobs/ai-precompute-cron.processor';
import { MarketModule } from '../modules/market';
import { ObservabilityModule } from '../observability/observability.module';

import { AIResolver } from './ai.resolver';
import { AIService } from './ai.service';
import { AIAuditService } from './audit/ai-audit.service';
import { AICacheService } from './cache/ai-cache.service';
import { QuotaService } from './quota/quota.service';

@Module({
  imports: [
    MarketModule,
    ObservabilityModule,
    BullModule.registerQueue({ name: AI_PRECOMPUTE_QUEUE }),
  ],
  providers: [
    AIAuditService,
    AICacheService,
    QuotaService,
    AIService,
    AIResolver,
    AIPrecomputeCronProcessor,
  ],
  exports: [AIService],
})
export class AIModule {}
