// MM-011 — login form state + submission.
// Per prompt 01 — this hook owns the orchestration; the screen file just wires
// hook outputs to UI components and stays under 150 lines.

import { zodResolver } from '@hookform/resolvers/zod';
import { loginInputSchema, type LoginInput } from '@mimir/shared';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/lib/auth/AuthProvider';

interface UseLoginFormResult {
  form: ReturnType<typeof useForm<LoginInput>>;
  submit: () => Promise<void>;
  submitError: string | null;
  isSubmitting: boolean;
}

function readableAuthError(err: unknown): string {
  if (err instanceof Error) {
    if (err.message.includes('401')) return 'Invalid email or password.';
    if (err.message.includes('429')) return 'Too many attempts. Try again in a minute.';
    if (err.message.toLowerCase().includes('network')) {
      return 'Network error — check your connection and try again.';
    }
  }
  return 'Something went wrong signing in. Please try again.';
}

export function useLoginForm(): UseLoginFormResult {
  const { signIn } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  });

  const submit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await signIn(values.email, values.password);
      // Routing happens in the (auth)/_layout via <Redirect> reacting to
      // isAuthenticated flipping to true. Keep this hook focused on state.
    } catch (err) {
      setSubmitError(readableAuthError(err));
    }
  });

  return {
    form,
    submit,
    submitError,
    isSubmitting: form.formState.isSubmitting,
  };
}
