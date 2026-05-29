// Mimir API — bootstrap.
// CLAUDE.md §13 — global validation pipe; structured logger; graceful shutdown.
// MM-016 — Sentry init MUST happen before NestFactory.create so it can capture
// bootstrap-time errors. Keep it as the very first line of bootstrap().

import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { initSentryEarly } from './observability/sentry.bootstrap';

async function bootstrap(): Promise<void> {
  initSentryEarly();

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  console.info(`[mimir-api] listening on :${port}`);
}

void bootstrap();
