// MM-013 — onboarding (budget tier selection) input.
// Custom tier amount must be inside [CUSTOM_TIER_MIN, CUSTOM_TIER_MAX].

import { z } from 'zod';

import { BUDGET_TIERS, CUSTOM_TIER_MAX, CUSTOM_TIER_MIN } from '../constants/budget-tiers';

export const onboardingInputSchema = z
  .object({
    budgetTierId: z.enum([
      BUDGET_TIERS.TIER_10K.id,
      BUDGET_TIERS.TIER_25K.id,
      BUDGET_TIERS.TIER_50K.id,
      BUDGET_TIERS.TIER_1L.id,
      BUDGET_TIERS.CUSTOM.id,
    ]),
    customAmount: z.number().int().positive().min(CUSTOM_TIER_MIN).max(CUSTOM_TIER_MAX).optional(),
    ageAttested: z.literal(true),
    termsAccepted: z.literal(true),
  })
  .refine((input) => input.budgetTierId !== 'CUSTOM' || typeof input.customAmount === 'number', {
    message: 'customAmount is required when budgetTierId is CUSTOM',
    path: ['customAmount'],
  });

export type OnboardingInput = z.infer<typeof onboardingInputSchema>;
