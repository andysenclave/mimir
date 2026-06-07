// OrderGql — GraphQL @ObjectType for a simulated trade order (MM-026).
// Prompt 24 (graphql-resolver): entity files live in entities/, named {name}.entity.ts.
// Mirrors the Order Prisma model — only exposes fields relevant to the mobile client.

import { Field, Float, ID, Int, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType('Order', { description: 'A completed simulated market order.' })
export class OrderGql {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { description: 'NSE symbol, e.g. RELIANCE.' })
  symbol!: string;

  @Field(() => String, { description: 'BUY or SELL.' })
  type!: string;

  @Field(() => Int, { description: 'Number of shares traded.' })
  quantity!: number;

  @Field(() => Float, { description: 'Price per share at execution (LTP).' })
  priceAtExecution!: number;

  @Field(() => Float, { description: 'Total order value = priceAtExecution × quantity.' })
  orderValue!: number;

  @Field(() => Float, {
    nullable: true,
    description: 'Realized P&L for SELL orders. Null for BUY orders.',
  })
  realizedPnl?: number | null;

  @Field(() => String, { description: 'PENDING | FILLED | REJECTED.' })
  status!: string;

  // Explicit () => String required for nullable string — code-first reflection
  // cannot infer the type for `string | null | undefined` properties.
  @Field(() => String, { nullable: true, description: 'Reason for REJECTED status, if applicable.' })
  failureReason?: string | null;

  @Field(() => String, { description: 'Client-generated UUID used for idempotency.' })
  correlationId!: string;

  @Field(() => GraphQLISODateTime, { description: 'Timestamp when the order was executed.' })
  executedAt!: Date;
}
