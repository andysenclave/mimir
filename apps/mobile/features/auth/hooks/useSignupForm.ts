// MM-012 — signup form state + submission.
// Mirrors useLoginForm's shape. Maps backend validation errors back to a
// readable message so the form can render them inline.

import { zodResolver } from '@hookform/resolvers/zod';
import { signupInputSchema, type SignupInput } from '@mimir/shared';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/lib/auth/AuthProvider';

interface UseSignupFormResult {
  form: ReturnType<typeof useForm<SignupInput>>;
  submit: () => Promise<void>;
  submitError: string | null;
  isSubmitting: boolean;
}

function readableSignupError(err: unknown): string {
  if (err instanceof Error) {
    if (err.message.includes('409')) return 'That email is already registered. Sign in instead?';
    if (err.message.includes('400')) return 'Check your inputs and try again.';
    if (err.message.toLowerCase().includes('network')) {
      return 'Network error — check your connection and try again.';
    }
  }
  return 'Something went wrong creating your account. Please try again.';
}

export function useSignupForm(): UseSignupFormResult {
  const { signUp } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupInputSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      ageAttested: true as const,
      termsAccepted: true as const,
    },
  });

  // Reset attestations to false on first render — the literal-true defaults
  // above satisfy zod, but the UX needs explicit user opt-in.
  if (form.getValues('ageAttested') === true && !form.formState.isDirty) {
    // Only reset on first mount; subsequent renders preserve user state.
    form.setValue('ageAttested', false as unknown as true, { shouldValidate: false });
    form.setValue('termsAccepted', false as unknown as true, { shouldValidate: false });
  }

  const submit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await signUp(values.email, values.password, {
        ageAttested: values.ageAttested,
        termsAccepted: values.termsAccepted,
      });
      // Routing handled by (auth)/_layout reacting to isAuthenticated flip.
    } catch (err) {
      setSubmitError(readableSignupError(err));
    }
  });

  return {
    form,
    submit,
    submitError,
    isSubmitting: form.formState.isSubmitting,
  };
}
