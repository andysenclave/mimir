/**
 * Sign up screen for new user registration
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, themeColors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { AuthStackParamList } from '@/types/navigation';
import { useAuth } from '@/hooks/useAuth';

type SignupScreenProps = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }): React.ReactElement => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signup, isLoading } = useAuth();

  const handleSignup = async (): Promise<void> => {
    if (!name || !email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await signup(email, password, name);
    } catch (error) {
      alert('Sign up failed. Please try again.');
    }
  };

  const goToLogin = (): void => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join Mimir Today</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor={colors.gray400}
          value={name}
          onChangeText={setName}
          editable={!isLoading}
          autoCapitalize="words"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.gray400}
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.gray400}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor={colors.gray400}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={goToLogin} disabled={isLoading}>
          <Text style={styles.linkText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.dark.background,
    justifyContent: 'center',
    paddingHorizontal: layout.spacing.lg,
  },
  title: {
    fontSize: layout.fontSize['3xl'],
    fontWeight: '700',
    color: colors.primaryLight,
    textAlign: 'center',
    marginBottom: layout.spacing.sm,
  },
  subtitle: {
    fontSize: layout.fontSize.md,
    color: colors.darkTextSecondary,
    textAlign: 'center',
    marginBottom: layout.spacing.xl,
  },
  form: {
    marginBottom: layout.spacing.xl,
  },
  input: {
    backgroundColor: themeColors.dark.secondaryBackground,
    borderColor: themeColors.dark.border,
    borderWidth: 1,
    borderRadius: layout.radius.md,
    paddingHorizontal: layout.spacing.md,
    paddingVertical: layout.spacing.md,
    color: colors.darkText,
    marginBottom: layout.spacing.md,
    fontSize: layout.fontSize.base,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: layout.radius.md,
    paddingVertical: layout.spacing.md,
    alignItems: 'center',
    marginTop: layout.spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: layout.fontSize.base,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: colors.darkTextSecondary,
    fontSize: layout.fontSize.sm,
  },
  linkText: {
    color: colors.primaryLight,
    fontSize: layout.fontSize.sm,
    fontWeight: '600',
  },
});
