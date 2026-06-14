// MM-010 — ADR-0001 fallback auth service.
// CLAUDE.md §13 — typed exceptions, never expose internals. Per prompt 14, every
// service method follows VALIDATE → RESOLVE → EXECUTE → RETURN.

import { createHash, randomBytes } from 'node:crypto';

import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';

import type { Env } from '../../config/env.schema';
import { PrismaService } from '../../prisma/prisma.service';

import type { LoginDto } from './dto/login.dto';
import type { SignupDto } from './dto/signup.dto';

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    displayName: string | null;
    onboardingDone: boolean;
  };
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly bcryptCost = 12;
  private readonly refreshTtlDays: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) {
    this.refreshTtlDays = this.config.get<number>('JWT_REFRESH_TTL_DAYS', 30);
  }

  async signup(dto: SignupDto): Promise<AuthResponse> {
    const existing = await this.prisma.authCredential.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await hash(dto.password, this.bcryptCost);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        ageAttested: dto.ageAttested,
        termsAccepted: dto.termsAccepted,
        authCredential: {
          create: {
            email: dto.email,
            passwordHash,
          },
        },
        notificationPreferences: { create: {} },
      },
    });

    return this.issueTokens(user.id, user.email, user.displayName, user.onboardingDone);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const credential = await this.prisma.authCredential.findUnique({
      where: { email: dto.email },
      include: { user: true },
    });
    // Generic message to avoid email enumeration.
    if (!credential) throw new UnauthorizedException('Invalid credentials');

    const ok = await compare(dto.password, credential.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(
      credential.user.id,
      credential.user.email,
      credential.user.displayName,
      credential.user.onboardingDone,
    );
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const tokenHash = this.hashToken(refreshToken);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      // Defensive: also revoke the entire family on suspicious reuse.
      if (stored && !stored.revoked) {
        await this.prisma.refreshToken.updateMany({
          where: { userId: stored.userId, revoked: false },
          data: { revoked: true },
        });
        this.logger.warn(`refresh token reuse detected for userId=${stored.userId}`);
      }
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Single-use rotation: revoke this one, issue a new pair.
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    return this.issueTokens(
      stored.user.id,
      stored.user.email,
      stored.user.displayName,
      stored.user.onboardingDone,
    );
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    // Defensive: only revoke if it actually belongs to this user.
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, userId, revoked: false },
      data: { revoked: true },
    });
  }

  // ───────── private ─────────

  private async issueTokens(
    userId: string,
    email: string,
    displayName: string | null,
    onboardingDone: boolean,
  ): Promise<AuthResponse> {
    const accessToken = await this.jwt.signAsync({ sub: userId, email });
    const refreshToken = randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + this.refreshTtlDays * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: userId, email, displayName, onboardingDone },
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
