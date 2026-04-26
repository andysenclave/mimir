/**
 * Trade screen - place buy/sell orders
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabsParamList } from '@/types/navigation';
import { colors, themeColors } from '@/constants/colors';
import { layout } from '@/constants/layout';

type TradeScreenProps = NativeStackScreenProps<MainTabsParamList, 'Trade'>;

export const TradeScreen: React.FC<TradeScreenProps> = (): React.ReactElement => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trade</Text>
      <Text style={styles.subtitle}>Buy and sell stocks</Text>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Types</Text>
          <Text style={styles.placeholder}>Market Order / Limit Order</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <Text style={styles.stat}>Available: ₹100,000.00</Text>
          <Text style={styles.stat}>Margin Used: ₹0.00</Text>
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
  section: {
    backgroundColor: themeColors.dark.secondaryBackground,
    borderColor: themeColors.dark.border,
    borderWidth: 1,
    borderRadius: layout.radius.md,
    paddingHorizontal: layout.spacing.md,
    paddingVertical: layout.spacing.lg,
    marginBottom: layout.spacing.lg,
  },
  sectionTitle: {
    fontSize: layout.fontSize.lg,
    fontWeight: '600',
    color: colors.darkText,
    marginBottom: layout.spacing.md,
  },
  placeholder: {
    fontSize: layout.fontSize.sm,
    color: colors.darkTextSecondary,
  },
  stat: {
    fontSize: layout.fontSize.sm,
    color: colors.darkTextSecondary,
    marginBottom: layout.spacing.sm,
  },
});
