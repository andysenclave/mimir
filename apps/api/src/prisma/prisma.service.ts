// CLAUDE.md §7 — central PrismaService; module-level @Global so feature modules
// don't have to import PrismaModule each time. Logging stays minimal in MM-003;
// query telemetry + correlation IDs added in MM-016 / MM-017 stories.

import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Prisma connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
