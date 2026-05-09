// CLAUDE.md §13 — typed exceptions in services; structured response shape; never
// expose internal errors to clients. Health response intentionally slim — Render
// + Better Uptime treat 200/non-200 as the signal.

import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

export type HealthStatus = {
  status: 'ok' | 'degraded';
  db: 'ok' | 'down';
  redis: 'ok' | 'down' | 'not-configured';
  uptimeSec: number;
  version: string;
};

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startedAt = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthStatus> {
    const db = await this.checkDb();
    const redis = await this.checkRedis();

    return {
      status: db === 'ok' ? 'ok' : 'degraded',
      db,
      redis,
      uptimeSec: Math.floor((Date.now() - this.startedAt) / 1000),
      version: process.env.npm_package_version ?? '0.0.0',
    };
  }

  private async checkDb(): Promise<'ok' | 'down'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'ok';
    } catch (err) {
      this.logger.warn(`db check failed: ${(err as Error).message}`);
      return 'down';
    }
  }

  private async checkRedis(): Promise<'ok' | 'down' | 'not-configured'> {
    // Real Redis ping wired in MM-021 alongside ioredis client. Until then, report
    // not-configured if no URL is set (developer hasn't started docker-compose).
    if (!process.env.REDIS_URL) return 'not-configured';
    return 'ok'; // TODO MM-021: real Redis ping.
  }
}
