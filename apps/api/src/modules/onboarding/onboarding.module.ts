import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { OnboardingResolver } from './onboarding.resolver';
import { OnboardingService } from './onboarding.service';

@Module({
  imports: [AuthModule], // for LocalAuthGuard
  providers: [OnboardingService, OnboardingResolver],
})
export class OnboardingModule {}
