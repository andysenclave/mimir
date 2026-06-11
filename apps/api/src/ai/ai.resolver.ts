// MM-032 — aiInsight(symbol) query.
// Prompt 24 (resolver discipline): thin resolver, one service call.
// Returns null when: kill switch off, ANTHROPIC_API_KEY absent, cache miss + quota exceeded,
// all retries exhausted. Mobile hides the AI card section on null — never shows an error toast.

import { Logger, UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { CurrentUser, type AuthUser } from '../common/decorators/current-user.decorator';
import { LocalAuthGuard } from '../modules/auth/auth.guard';
import { PostHogService } from '../observability/posthog.service';

import { AIService } from './ai.service';
import { AIInsightGql } from './entities/ai-insight.entity';

@Resolver()
@UseGuards(LocalAuthGuard)
export class AIResolver {
  private readonly logger = new Logger(AIResolver.name);

  constructor(
    private readonly aiService: AIService,
    private readonly postHog: PostHogService,
  ) {}

  @Query(() => AIInsightGql, {
    nullable: true,
    description:
      'AI-generated educational context for a stock. Returns null when the feature flag is off, ' +
      'quota is exhausted, or insight generation failed. Mobile hides the section on null.',
  })
  async aiInsight(
    @CurrentUser() user: AuthUser,
    @Args('symbol') symbol: string,
  ): Promise<AIInsightGql | null> {
    // Kill switch — PostHog feature flag `ai_insights_enabled`
    const enabled = await this.postHog
      .isFeatureEnabled('ai_insights_enabled', user.id)
      .catch(() => false); // if PostHog is down, fail open (flag assumed enabled)
    if (!enabled) {
      this.logger.debug(`ai_insights_enabled=false for user ${user.id}, returning null`);
      return null;
    }

    return this.aiService.generateInsight(symbol.toUpperCase(), { userId: user.id });
  }
}
