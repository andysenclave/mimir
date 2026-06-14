// CLAUDE.md §13 + §11 — backend Sentry events scrubbed before send.
// Same redaction surface as the mobile scrubber.

import type { Event, EventHint } from '@sentry/node';

const PII_HEADERS = ['authorization', 'cookie', 'set-cookie', 'x-api-key'];
const PII_FIELDS = ['password', 'newPassword', 'refreshToken', 'accessToken', 'token', 'tokenHash'];

export function scrubPII(event: Event, _hint?: EventHint): Event | null {
  if (event.user) {
    const { email: _email, username: _username, ip_address: _ip, ...rest } = event.user;
    event.user = rest;
  }

  if (event.request?.headers) {
    for (const key of Object.keys(event.request.headers)) {
      if (PII_HEADERS.includes(key.toLowerCase())) {
        event.request.headers[key] = '[redacted]';
      }
    }
  }

  if (typeof event.request?.data === 'object' && event.request.data !== null) {
    redactObject(event.request.data as Record<string, unknown>);
  }

  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.filter((crumb) => {
      const url = typeof crumb.data?.['url'] === 'string' ? crumb.data['url'] : '';
      return !url.includes('/auth/');
    });
  }

  return event;
}

function redactObject(obj: Record<string, unknown>): void {
  for (const key of Object.keys(obj)) {
    if (PII_FIELDS.includes(key)) {
      obj[key] = '[redacted]';
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      redactObject(obj[key] as Record<string, unknown>);
    }
  }
}
