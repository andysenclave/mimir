import { Module } from '@nestjs/common';

import { AIModule } from '../../ai';
import { ObservabilityModule } from '../../observability/observability.module';
import { PrismaModule } from '../../prisma/prisma.module';

import { AISuggestionsService } from './ai-suggestions.service';
import { LearningResolver } from './learning.resolver';
import { LearningService } from './learning.service';

@Module({
  imports: [PrismaModule, AIModule, ObservabilityModule],
  providers: [LearningResolver, LearningService, AISuggestionsService],
})
export class LearningModule {}
