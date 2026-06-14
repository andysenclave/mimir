// MM-011 — Login screen.
// Per prompt 30: thin screen, calls the feature hook, composes UI primitives.
// Visual reference: docs/mockups/tsx/mimir-screens.tsx LoginScreen + Login screen.png.

import { router } from 'expo-router';
import { useCallback } from 'react';
import { Controller } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { OAuthButton } from '@/components/ui/OAuthButton';
import { useLoginForm } from '@/features/auth/hooks/useLoginForm';

export default function LoginScreen(): React.JSX.Element {
  const { form, submit, submitError, isSubmitting } = useLoginForm();
  const { control, formState } = form;

  const showOAuthSoon = useCallback((provider: 'Google' | 'Apple') => {
    Alert.alert(
      `${provider} sign-in`,
      'Available after the Heimdal SDK swap (MM-S2-AUTH-SWAP). Use email + password for now.',
    );
  }, []);

  const showForgotSoon = useCallback(() => {
    Alert.alert(
      'Forgot password',
      'Password reset lands with the Heimdal SDK swap (MM-S2-AUTH-SWAP).',
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
          <View className="mb-12 mt-10 items-center">
            <View className="mb-4">
              <Logo />
            </View>
            <Text className="text-[28px] font-bold tracking-tight text-text-primary">mimir</Text>
            <Text className="mt-1 text-sm text-text-tertiary">
              Learn to invest. Practice risk-free.
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
                <Input
                  label="Password"
                  placeholder="Enter password"
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password"
                  textContentType="password"
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                  editable={!isSubmitting}
                  returnKeyType="go"
                  onSubmitEditing={() => void submit()}
                />
              )}
            />
          </View>

          {/* Forgot password */}
          <View className="mb-6 self-end">
            <Text className="text-xs font-medium text-accent" onPress={showForgotSoon}>
              Forgot password?
            </Text>
          </View>

          {/* Submit error */}
          {submitError !== null && (
            <View className="mb-4 rounded-md border border-loss/30 bg-loss/10 px-3 py-2.5">
              <Text className="text-sm font-medium text-loss">{submitError}</Text>
            </View>
          )}

          {/* Sign in CTA */}
          <Button
            onPress={() => void submit()}
            loading={isSubmitting}
            disabled={!formState.isValid && formState.isSubmitted}
          >
            Sign In
          </Button>

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

          {/* Create account */}
          <View className="mt-auto pt-10 items-center">
            <Text className="text-sm text-text-tertiary">
              New here?{' '}
              <Text className="font-semibold text-accent" onPress={() => router.push('/signup')}>
                Create Account
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
