// MM-010 — passport-jwt strategy. Reads Bearer token, verifies with the same
// algo/key the JwtModule was configured with, attaches { id, email } as req.user.

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, type StrategyOptionsWithoutRequest } from 'passport-jwt';

import type { AuthUser } from '../../common/decorators/current-user.decorator';
import type { Env } from '../../config/env.schema';

type JwtPayload = {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
  iss?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService<Env, true>) {
    const secret = config.get<string | undefined>('JWT_SECRET');
    const publicKey = config.get<string | undefined>('JWT_PUBLIC_KEY');
    const issuer = config.get<string>('JWT_ISSUER');

    const options: StrategyOptionsWithoutRequest = publicKey
      ? {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey: publicKey,
          algorithms: ['RS256'],
          issuer,
          ignoreExpiration: false,
        }
      : {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey: secret ?? '',
          algorithms: ['HS256'],
          issuer,
          ignoreExpiration: false,
        };

    super(options);
  }

  validate(payload: JwtPayload): AuthUser {
    if (!payload?.sub || !payload?.email) {
      throw new UnauthorizedException();
    }
    return { id: payload.sub, email: payload.email };
  }
}
