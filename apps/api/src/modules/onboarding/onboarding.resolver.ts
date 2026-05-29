// MM-013 — completeOnboarding mutation.
// Per prompt 24: thin resolver, calls one service method, returns @ObjectType.
// Auth: behind LocalAuthGuard (default-secure); requires a valid JWT.

import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { LocalAuthGuard } from '../auth/auth.guard';

import { CompleteOnboardingInput } from './dto/complete-onboarding.input';
import { OnboardingResult } from './entities/onboarding-result.entity';
import { OnboardingService } from './onboarding.service';

@Resolver(() => OnboardingResult)
@UseGuards(LocalAuthGuard)
export class OnboardingResolver {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Mutation(() => OnboardingResult, {
    description:
      'Complete onboarding by setting the monthly budget tier. Creates the first ACTIVE MonthlyBudget and flips User.onboardingDone. Idempotent.',
  })
  completeOnboarding(
    @CurrentUser() user: AuthUser | null,
    @Args('input') input: CompleteOnboardingInput,
  ): Promise<OnboardingResult> {
    if (user === null) {
      // Should never happen — LocalAuthGuard already rejected unauth requests.
      throw new Error('User context missing despite LocalAuthGuard');
    }
    return this.onboardingService.completeOnboarding(user.id, input);
  }
}
