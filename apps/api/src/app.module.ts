import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';

import { envSchema } from './config/env.schema';
import { graphqlConfigFactory } from './graphql/graphql-config.factory';
import { HealthModule } from './health/health.module';
import { HeartbeatModule } from './heartbeat/heartbeat.module';
import { MeModule } from './me/me.module';
import { AuthModule } from './modules/auth/auth.module';
import { MarketModule } from './modules/market';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { ObservabilityModule } from './observability/observability.module';
import { PrismaModule } from './prisma/prisma.module';
import { PubSubModule } from './pubsub/pubsub.module';

@Module({
  imports: [
    // CLAUDE.md §17 — env validated at boot via Zod.
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      // Load .env first, then .env.local — local values take precedence.
      // .env.local is gitignored and holds real dev secrets (CLAUDE.md §17).
      envFilePath: ['.env', '.env.local'],
      validate: (env) => envSchema.parse(env),
    }),

    PrismaModule,
    PubSubModule,
    // BullMQ global connection — all queues share this Redis connection.
    // Individual modules register their queues via BullModule.registerQueue.
    // BullMQ bundles its own ioredis — pass plain options to avoid type clash.
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
        const parsed = new URL(redisUrl);
        return {
          connection: {
            host: parsed.hostname,
            port: parseInt(parsed.port || '6379', 10),
            password: parsed.password || undefined,
            maxRetriesPerRequest: null,
          },
        };
      },
      inject: [ConfigService],
    }),
    ObservabilityModule, // MM-016 + MM-017 — Sentry interceptor + PostHog + flag refresher

    // CLAUDE.md §3 — code-first GraphQL with graphql-ws subscription transport.
    // SDL is auto-written to packages/graphql-schema/schema.graphql on build.
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      ...graphqlConfigFactory(),
    }),

    HealthModule,
    HeartbeatModule,
    AuthModule,
    MeModule,
    OnboardingModule,
    NotificationsModule, // MM-018 — registerPushDevice mutation
    MarketModule,        // MM-021 — MarketDataPoller + MarketSnapshot
  ],
})
export class AppModule {}
