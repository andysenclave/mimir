/**
 * Portfolio screen - displays user's holdings and performance
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabsParamList } from '@/types/navigation';
import { colors, themeColors } from '@/constants/colors';
import { layout } from '@/constants/layout';

type PortfolioScreenProps = NativeStackScreenProps<MainTabsParamList, 'Portfolio'>;

export const PortfolioScreen: React.FC<PortfolioScreenProps> = (): React.ReactElement => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Portfolio</Text>
      <Text style={styles.subtitle}>Your holdings and performance</Text>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Value</Text>
          <Text style={styles.cardValue}>₹0.00</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Gain/Loss</Text>
          <Text style={[styles.cardValue, styles.neutral]}>₹0.00</Text>
        </View>

        <Text style={styles.placeholder}>No holdings yet</Text>
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
    justifyContent: 'center',
  },
  card: {
    backgroundColor: themeColors.dark.secondaryBackground,
    borderColor: themeColors.dark.border,
    borderWidth: 1,
    borderRadius: layout.radius.md,
    paddingHorizontal: layout.spacing.md,
    paddingVertical: layout.spacing.lg,
    marginBottom: layout.spacing.md,
  },
  cardLabel: {
    fontSize: layout.fontSize.sm,
    color: colors.darkTextSecondary,
    marginBottom: layout.spacing.sm,
  },
  cardValue: {
    fontSize: layout.fontSize['2xl'],
    fontWeight: '700',
    color: colors.primaryLight,
  },
  neutral: {
    color: colors.gray400,
  },
  placeholder: {
    fontSize: layout.fontSize.base,
    color: colors.darkTextSecondary,
    textAlign: 'center',
    marginTop: layout.spacing.xl,
  },
});
