import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';

import { envSchema } from './config/env.schema';
import { graphqlConfigFactory } from './graphql/graphql-config.factory';
import { HealthModule } from './health/health.module';
import { HeartbeatModule } from './heartbeat/heartbeat.module';
import { MeModule } from './me/me.module';
import { PrismaModule } from './prisma/prisma.module';
import { PubSubModule } from './pubsub/pubsub.module';
import { AuthModule } from './modules/auth/auth.module';

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

    // CLAUDE.md §3 — code-first GraphQL with graphql-ws subscription transport.
    // SDL is auto-written to packages/graphql-schema/schema.graphql on build.
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      ...graphqlConfigFactory(),
    }),

    HealthModule,
    HeartbeatModule,
    MeModule,
    AuthModule,
  ],
})
export class AppModule {}
