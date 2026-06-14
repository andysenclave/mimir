// MM-026 will consume this on the backend; mobile generates the UUID before submitting.
// CLAUDE.md §5 — Zod is the runtime boundary across apps.
// CLAUDE.md §8 — placeOrder requires a clientGeneratedOrderId for idempotency.

import { z } from 'zod';

import { ORDER_TYPES } from '../constants/order-types';

export const placeOrderInputSchema = z.object({
  symbol: z
    .string()
    .min(1)
    .max(20)
    .regex(/^[A-Z0-9.-]+$/, 'NSE-style symbol expected (uppercase A-Z, digits, dot, dash)'),
  type: z.enum([ORDER_TYPES.BUY, ORDER_TYPES.SELL]),
  quantity: z.number().int().positive().max(1_000_000),
  clientGeneratedOrderId: z.string().uuid(),
});

export type PlaceOrderInput = z.infer<typeof placeOrderInputSchema>;
