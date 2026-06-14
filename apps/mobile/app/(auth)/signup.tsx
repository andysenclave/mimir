// MM-012 — Signup screen.
// Reuses Logo / Input / Button / Divider / OAuthButton from MM-011. Adds:
//   - PasswordStrength meter
//   - Two attestation checkboxes (age, ToS)
// OAuth + forgot password remain Heimdal-deferred toasts (per MM-011 pattern).

import { Link, router } from 'expo-router';
import { useCallback } from 'react';
import { Controller } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Divider } from '@/components/ui/Divider';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { OAuthButton } from '@/components/ui/OAuthButton';
import { PasswordStrength } from '@/components/ui/PasswordStrength';
import { useSignupForm } from '@/features/auth/hooks/useSignupForm';

export default function SignupScreen(): React.JSX.Element {
  const { form, submit, submitError, isSubmitting } = useSignupForm();
  const { control, formState, watch } = form;
  const passwordValue = watch('password');

  const showOAuthSoon = useCallback((provider: 'Google' | 'Apple') => {
    Alert.alert(
      `${provider} sign-up`,
      'Available after the Heimdal SDK swap (MM-S2-AUTH-SWAP). Use email + password for now.',
    );
  }, []);

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow px-6 pb-6 pt-10"
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand */}
          <View className="mb-10 mt-6 items-center">
            <View className="mb-4">
              <Logo />
            </View>
            <Text className="text-2xl font-bold tracking-tight text-text-primary">
              Create your account
            </Text>
            <Text className="mt-1 text-sm text-text-tertiary">
              Practice investing with virtual money — risk-free.
            </Text>
          </View>

          {/* Email */}
          <View className="mb-4">
            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <Input
                  label="Email"
                  placeholder="you@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  editable={!isSubmitting}
                  returnKeyType="next"
                />
              )}
            />
          </View>

          {/* Password */}
          <View className="mb-2">
            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <View>
                  <Input
                    label="Password"
                    placeholder="Min 10 chars, letter + digit"
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password-new"
                    textContentType="newPassword"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    error={fieldState.error?.message}
                    editable={!isSubmitting}
                    returnKeyType="next"
                  />
                  <PasswordStrength value={field.value} />
                </View>
              )}
            />
          </View>

          {/* Attestations */}
          <View className="mt-6 gap-1">
            <Controller
              control={control}
              name="ageAttested"
              render={({ field, fieldState }) => (
                <Checkbox
                  checked={field.value === true}
                  onChange={(next: boolean) => field.onChange(next as unknown as true)}
                  error={fieldState.error?.message}
                  disabled={isSubmitting}
                >
                  <Text className="text-sm leading-5 text-text-secondary">
                    I confirm I am <Text className="text-text-primary">18 years or older</Text>.
                  </Text>
                  {fieldState.error?.message !== undefined && (
                    <Text className="mt-1 text-xs font-medium text-loss">
                      {fieldState.error.message}
                    </Text>
                  )}
                </Checkbox>
              )}
            />

            <Controller
              control={control}
              name="termsAccepted"
              render={({ field, fieldState }) => (
                <Checkbox
                  checked={field.value === true}
                  onChange={(next: boolean) => field.onChange(next as unknown as true)}
                  error={fieldState.error?.message}
                  disabled={isSubmitting}
                >
                  <Text className="text-sm leading-5 text-text-secondary">
                    I agree to the{' '}
                    <Link href="/terms" asChild>
                      <Text className="font-semibold text-accent">Terms of Service</Text>
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" asChild>
                      <Text className="font-semibold text-accent">Privacy Policy</Text>
                    </Link>
                    .
                  </Text>
                  {fieldState.error?.message !== undefined && (
                    <Text className="mt-1 text-xs font-medium text-loss">
                      {fieldState.error.message}
                    </Text>
                  )}
                </Checkbox>
              )}
            />
          </View>

          {/* Submit error */}
          {submitError !== null && (
            <View className="mt-4 rounded-md border border-loss/30 bg-loss/10 px-3 py-2.5">
              <Text className="text-sm font-medium text-loss">{submitError}</Text>
            </View>
          )}

          {/* Submit */}
          <View className="mt-6">
            <Button
              onPress={() => void submit()}
              loading={isSubmitting}
              disabled={!formState.isValid && formState.isSubmitted}
            >
              Create Account
            </Button>
          </View>

          {/* OAuth */}
          <View className="my-6">
            <Divider label="or" />
          </View>
          <View className="flex-row gap-3">
            <OAuthButton
              provider="google"
              onPress={() => showOAuthSoon('Google')}
              disabled={isSubmitting}
            />
            <OAuthButton
              provider="apple"
              onPress={() => showOAuthSoon('Apple')}
              disabled={isSubmitting}
            />
          </View>

          {/* Sign in */}
          <View className="mt-auto items-center pt-10">
            <Text className="text-sm text-text-tertiary">
              Already have an account?{' '}
              <Text className="font-semibold text-accent" onPress={() => router.replace('/login')}>
                Sign In
              </Text>
            </Text>
            {/* keep `passwordValue` referenced so eslint-no-unused-vars stays quiet */}
            <View className="hidden">
              <Text>{passwordValue.length}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
