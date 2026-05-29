// MM-013 — me service. Replaces the MM-006 hardcoded resolver with a real
// Prisma fetch keyed off the @CurrentUser id.

import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import type { AuthUser } from './entities/auth-user.entity';

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, displayName: true, onboardingDone: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      email: user.email,
      ...(user.displayName !== null && { displayName: user.displayName }),
      onboardingDone: user.onboardingDone,
    };
  }
}
