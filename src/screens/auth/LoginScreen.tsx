/**
 * Login screen for user authentication
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, themeColors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { AuthStackParamList } from '@/types/navigation';
import { useAuth } from '@/hooks/useAuth';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }): React.ReactElement => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
    try {
      await login(email, password);
    } catch (error) {
      alert('Login failed. Please try again.');
    }
  };

  const goToSignup = (): void => {
    navigation.navigate('Signup');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mimir</Text>
      <Text style={styles.subtitle}>Paper Trading Simulator</Text>

      <View style={styles.form}>
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

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={goToSignup} disabled={isLoading}>
          <Text style={styles.linkText}>Sign up</Text>
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
