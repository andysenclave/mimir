import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';

import { LearningResolver } from './learning.resolver';
import { LearningService } from './learning.service';

@Module({
  imports: [PrismaModule],
  providers: [LearningResolver, LearningService],
})
export class LearningModule {}
