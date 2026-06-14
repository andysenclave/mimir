// MM-010 — ADR-0001 fallback auth module.
// REST /auth/* endpoints (signup, login, refresh, logout). JWT access + opaque
// refresh token rotation.
//
// ┌────────────────────────────────────────────────────────────────────────────┐
// │ TODO — SWAP TO @andysenclave/heimdal-nest (MM-S2-AUTH-SWAP, ADR-0001 §3). │
// │ Real Heimdal SDK packages confirmed available:                             │
// │   @andysenclave/heimdal-nest (backend)                                     │
// │   @andysenclave/heimdal-rn   (mobile)                                      │
// │ Detailed swap diff: _sprint-1-scaffold/HEIMDAL-SWAP-PLAN.md                │
// │ The LocalAuthGuard / @CurrentUser interfaces in this scaffold are designed │
// │ identical to the eventual @HeimdalGuard / @CurrentUser exports so the swap │
// │ is internal — call sites do not change.                                    │
// └────────────────────────────────────────────────────────────────────────────┘

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import type { Env } from '../../config/env.schema';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './auth.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const secret = config.get<string | undefined>('JWT_SECRET');
        const privateKey = config.get<string | undefined>('JWT_PRIVATE_KEY');
        const publicKey = config.get<string | undefined>('JWT_PUBLIC_KEY');
        const issuer = config.get<string>('JWT_ISSUER');
        const expiresIn = config.get<string>('JWT_ACCESS_TTL');

        if (privateKey && publicKey) {
          return {
            privateKey,
            publicKey,
            signOptions: { algorithm: 'RS256', expiresIn, issuer },
            verifyOptions: { algorithms: ['RS256'], issuer },
          };
        }
        return {
          secret,
          signOptions: { algorithm: 'HS256', expiresIn, issuer },
          verifyOptions: { algorithms: ['HS256'], issuer },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, PassportModule, JwtModule],
})
export class AuthModule {}
