/**
 * Watchlist screen - displays favorite stocks
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabsParamList } from '@/types/navigation';
import { colors, themeColors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { useAuth } from '@/hooks/useAuth';

type WatchlistScreenProps = NativeStackScreenProps<MainTabsParamList, 'Watchlist'>;

export const WatchlistScreen: React.FC<WatchlistScreenProps> = (): React.ReactElement => {
  const { user, logout } = useAuth();

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
    } catch (error) {
      alert('Logout failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Watchlist</Text>
      <Text style={styles.subtitle}>Your favorite stocks</Text>

      <View style={styles.content}>
        <Text style={styles.userInfo}>Welcome, {user?.name}</Text>
        <Text style={styles.placeholder}>No stocks in watchlist yet</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.dark.background,
    paddingHorizontal: layout.spacing.lg,
    paddingVertical: layout.spacing.lg,
  },
  title: {
    fontSize: layout.fontSize['2xl'],
    fontWeight: '700',
    color: colors.darkText,
    marginBottom: layout.spacing.sm,
  },
  subtitle: {
    fontSize: layout.fontSize.sm,
    color: colors.darkTextSecondary,
    marginBottom: layout.spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    fontSize: layout.fontSize.base,
    color: colors.primaryLight,
    marginBottom: layout.spacing.md,
    fontWeight: '600',
  },
  placeholder: {
    fontSize: layout.fontSize.base,
    color: colors.darkTextSecondary,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: colors.error,
    borderRadius: layout.radius.md,
    paddingVertical: layout.spacing.md,
    alignItems: 'center',
    marginBottom: layout.spacing.lg,
  },
  logoutText: {
    color: colors.white,
    fontSize: layout.fontSize.base,
    fontWeight: '600',
  },
});
