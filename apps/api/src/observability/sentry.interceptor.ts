// MM-016 — global NestJS interceptor that captures uncaught exceptions to Sentry.
// CLAUDE.md §13: typed exceptions (Unauthorized, BadRequest, etc.) are expected
// and are NOT reported. Only unexpected 5xx errors hit Sentry.

import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((err) => {
        if (this.shouldReport(err)) {
          // @ts-expect-error Sentry typings are very incomplete, and captureException accepts a 2nd arg with these options.
          Sentry.captureException(err, {
            tags: { source: 'nest-interceptor' },
            contexts: this.contextFromRequest(context),
          });
        }
        return throwError(() => err);
      }),
    );
  }

  private shouldReport(err: unknown): boolean {
    if (err instanceof HttpException) {
      // Only report 5xx — 4xx are client errors / typed business exceptions.
      return err.getStatus() >= HttpStatus.INTERNAL_SERVER_ERROR;
    }
    return true; // unknown error type — always report
  }

  private contextFromRequest(context: ExecutionContext): Record<string, unknown> {
    if (context.getType() !== 'http') return {};
    const req = context.switchToHttp().getRequest<{ method?: string; url?: string }>();
    return {
      request: { method: req?.method, url: req?.url },
    };
  }
}
