// MM-025 — PortfolioPerformanceGql entity.
// Prompt 24 (resolver discipline): @ObjectType returned by resolver, never a raw Prisma model.

import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PortfolioPerformanceGql {
  @Field(() => Float, {
    nullable: true,
    description: "User's portfolio daily % change. Null when the user has no holdings or prices are unavailable.",
  })
  portfolioChangePct!: number | null;

  @Field(() => Float, { description: 'NIFTY 50 daily % change.' })
  niftyChangePct!: number;

  @Field(() => Float, {
    nullable: true,
    description: 'S&P 500 daily % change. Null when Yahoo Finance is unavailable.',
  })
  sp500ChangePct!: number | null;

  @Field({ description: 'Template-based motivational copy. Never LLM-generated (CLAUDE.md §9).' })
  copy!: string;

  @Field({ description: 'False when the user has no holdings — card renders benchmark-only mode.' })
  hasHoldings!: boolean;
}
