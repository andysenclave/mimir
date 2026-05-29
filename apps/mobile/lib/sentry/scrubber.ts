// CLAUDE.md §16 + §11 — strip every form of PII from Sentry events before they
// leave the device. Tokens, raw email, password fields, and any breadcrumb
// containing /auth/* are the load-bearing redactions.
//
// Sentry RN doesn't re-export `ErrorEvent` / `EventHint` by name (they live in
// @sentry/core internally). Rather than depend on the deep import path, we use
// a structural type covering only the fields we touch — TypeScript variance
// makes this assignable to Sentry's `beforeSend` signature.

interface ScrubbableBreadcrumb {
  data?: Record<string, unknown>;
}

interface ScrubbableEvent {
  user?: { email?: string; username?: string; [k: string]: unknown };
  request?: {
    headers?: Record<string, string>;
    data?: unknown;
  };
  breadcrumbs?: ScrubbableBreadcrumb[];
}

const PII_HEADERS = ['authorization', 'cookie', 'set-cookie', 'x-api-key'];
const PII_FIELDS = ['password', 'newPassword', 'refreshToken', 'accessToken', 'token'];

export function scrubPII(event: ScrubbableEvent): ScrubbableEvent | null {
  // Strip user.email — keep id only (id is hashed Heimdal user id, safe).
  if (event.user) {
    const { email: _email, username: _username, ...rest } = event.user;
    event.user = rest;
  }

  // Redact sensitive request headers.
  if (event.request?.headers) {
    for (const key of Object.keys(event.request.headers)) {
      if (PII_HEADERS.includes(key.toLowerCase())) {
        event.request.headers[key] = '[redacted]';
      }
    }
  }

  // Redact request body fields that match known PII names.
  if (typeof event.request?.data === 'object' && event.request.data !== null) {
    redactObject(event.request.data as Record<string, unknown>);
  }

  // Strip breadcrumbs that hit auth endpoints — no token leaks via crumb URLs.
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.filter((crumb: ScrubbableBreadcrumb) => {
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
