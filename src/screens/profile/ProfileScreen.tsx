/**
 * Profile screen - user account and settings
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabsParamList } from '@/types/navigation';
import { colors, themeColors } from '@/constants/colors';
import { layout } from '@/constants/layout';
import { useAuth } from '@/hooks/useAuth';

type ProfileScreenProps = NativeStackScreenProps<MainTabsParamList, 'Profile'>;

export const ProfileScreen: React.FC<ProfileScreenProps> = (): React.ReactElement => {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Account settings and information</Text>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user?.name || 'N/A'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email || 'N/A'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>User ID</Text>
          <Text style={styles.value}>{user?.id || 'N/A'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Status</Text>
          <Text style={styles.status}>Active</Text>
        </View>
      </View>
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
  },
  card: {
    backgroundColor: themeColors.dark.secondaryBackground,
    borderColor: themeColors.dark.border,
    borderWidth: 1,
    borderRadius: layout.radius.md,
    paddingHorizontal: layout.spacing.md,
    paddingVertical: layout.spacing.md,
    marginBottom: layout.spacing.md,
  },
  label: {
    fontSize: layout.fontSize.sm,
    color: colors.darkTextSecondary,
    marginBottom: layout.spacing.xs,
  },
  value: {
    fontSize: layout.fontSize.base,
    fontWeight: '500',
    color: colors.darkText,
  },
  section: {
    backgroundColor: themeColors.dark.secondaryBackground,
    borderColor: themeColors.dark.border,
    borderWidth: 1,
    borderRadius: layout.radius.md,
    paddingHorizontal: layout.spacing.md,
    paddingVertical: layout.spacing.md,
    marginTop: layout.spacing.lg,
  },
  sectionTitle: {
    fontSize: layout.fontSize.sm,
    color: colors.darkTextSecondary,
    marginBottom: layout.spacing.sm,
  },
  status: {
    fontSize: layout.fontSize.base,
    fontWeight: '500',
    color: colors.success,
  },
});
