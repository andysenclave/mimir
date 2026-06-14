// MM-010 — passport-jwt strategy. Reads Bearer token, verifies with the same
// algo/key the JwtModule was configured with, attaches { id, email } as req.user.

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type StrategyOptionsWithoutRequest } from 'passport-jwt';

import type { AuthUser } from '../../common/decorators/current-user.decorator';
import type { Env } from '../../config/env.schema';

// Defensive Bearer-token extractor. passport-jwt's built-in
// ExtractJwt.fromAuthHeaderAsBearerToken() reads `request.headers.authorization`
// and throws an unhandled TypeError when a guarded GraphQL op reaches the strategy
// with no `headers` on the request (certain non-HTTP execution contexts). Returning
// null instead yields a clean auth rejection — no crash, no ExceptionsHandler spam.
const bearerTokenExtractor: StrategyOptionsWithoutRequest['jwtFromRequest'] = (req) => {
  const headers = (req as { headers?: Record<string, string | undefined> } | undefined)?.headers;
  const header = headers?.authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    const token = header.slice('Bearer '.length).trim();
    return token.length > 0 ? token : null;
  }
  return null;
};

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
          jwtFromRequest: bearerTokenExtractor,
          secretOrKey: publicKey,
          algorithms: ['RS256'],
          issuer,
          ignoreExpiration: false,
        }
      : {
          jwtFromRequest: bearerTokenExtractor,
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
