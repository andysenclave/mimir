// CLAUDE.md §5 — no enums; const object + derived type.

export const ORDER_TYPES = {
  BUY: 'BUY',
  SELL: 'SELL',
} as const;
export type OrderType = (typeof ORDER_TYPES)[keyof typeof ORDER_TYPES];

export const ORDER_STATUSES = {
  PENDING: 'PENDING',
  FILLED: 'FILLED',
  REJECTED: 'REJECTED',
} as const;
export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];

export const BUDGET_STATUSES = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
} as const;
export type BudgetStatus = (typeof BUDGET_STATUSES)[keyof typeof BUDGET_STATUSES];
