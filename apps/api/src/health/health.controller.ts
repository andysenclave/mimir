// MM-003 — minimal /health endpoint. Public (no auth) per CLAUDE.md §11.
// @Public() decorator added when HeimdalGuard lands in MM-010; until then nothing
// to opt out of.

import { Controller, Get } from '@nestjs/common';

import { HealthService, type HealthStatus } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check(): Promise<HealthStatus> {
    return this.healthService.check();
  }
}
