// CLAUDE.md §11 / prompt 24 — `@Public()` opts a route or resolver out of the
// default-secure guard. Used by /health and the /auth/* REST endpoints.

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);
