// MM-013 — completeOnboarding orchestration.
// Wraps the GraphQL mutation, updates the local AuthProvider state on success
// so the splash route picks up onboardingDone=true without a refetch round-trip.

import { gql, useMutation } from '@apollo/client';
import { useCallback, useState } from 'react';

import { useAuth } from '@/lib/auth/AuthProvider';

const COMPLETE_ONBOARDING = gql`
  mutation CompleteOnboarding($input: CompleteOnboardingInput!) {
    completeOnboarding(input: $input) {
      user {
        id
        email
        displayName
        onboardingDone
      }
      budget {
        id
        tier
        amount
        cycleStart
        cycleEnd
      }
    }
  }
`;

interface CompleteOnboardingArgs {
  budgetTierId: 'TIER_10K' | 'TIER_25K' | 'TIER_50K' | 'TIER_1L' | 'CUSTOM';
  customAmount?: number;
}

interface UseCompleteOnboardingResult {
  complete: (args: CompleteOnboardingArgs) => Promise<void>;
  loading: boolean;
  error: string | null;
}

function readableError(message: string | undefined): string {
  if (message === undefined) {
    return 'Could not save your budget. Please try again.';
  }
  if (message.toLowerCase().includes('network')) {
    return 'Network error — check your connection and try again.';
  }
  return 'Could not save your budget. Please try again.';
}

export function useCompleteOnboarding(): UseCompleteOnboardingResult {
  const { updateUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const [mutate, { loading }] = useMutation(COMPLETE_ONBOARDING);

  const complete = useCallback(
    async ({ budgetTierId, customAmount }: CompleteOnboardingArgs) => {
      setError(null);
      try {
        const res = await mutate({
          variables: {
            input: {
              budgetTierId,
              customAmount,
              ageAttested: true,
              termsAccepted: true,
            },
          },
        });
        const user = res.data?.completeOnboarding?.user;
        if (user) {
          updateUser({
            id: user.id,
            email: user.email,
            displayName: user.displayName ?? null,
            onboardingDone: user.onboardingDone,
          });
        }
      } catch (err) {
        setError(readableError(err instanceof Error ? err.message : undefined));
        throw err;
      }
    },
    [mutate, updateUser],
  );

  return { complete, loading, error };
}
