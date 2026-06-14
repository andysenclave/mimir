import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';

import { envSchema } from './config/env.schema';
import { graphqlConfigFactory } from './graphql/graphql-config.factory';
import { HealthModule } from './health/health.module';
import { HeartbeatModule } from './heartbeat/heartbeat.module';
import { MeModule } from './me/me.module';
import { AuthModule } from './modules/auth/auth.module';
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
      validate: (env) => envSchema.parse(env),
    }),

    PrismaModule,
    PubSubModule,
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
  ],
})
export class AppModule {}
