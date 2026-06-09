// MM-040 — Order-fill transactional notification template.
// TRANSACTIONAL category — bypasses quiet hours and daily cap. (CLAUDE.md §10)

export interface OrderFillPayload {
  symbol: string;
  orderType: 'BUY' | 'SELL';
  quantity: number;
  priceAtExecution: number;
}

export function orderFillTemplate(p: OrderFillPayload): {
  title: string;
  body: string;
  data: Record<string, string>;
} {
  const action = p.orderType === 'BUY' ? 'purchased' : 'sold';
  const priceFormatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(p.priceAtExecution);

  return {
    title: `Order filled — ${p.symbol}`,
    body: `You ${action} ${p.quantity} share${p.quantity > 1 ? 's' : ''} of ${p.symbol} at ${priceFormatted}. Educational simulation — not investment advice.`,
    data: { type: 'order_fill', symbol: p.symbol, route: '/(tabs)/portfolio' },
  };
}
