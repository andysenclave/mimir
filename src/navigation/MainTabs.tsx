/**
 * Main application tab navigation
 * Bottom tabs for Watchlist, Portfolio, Trade, and Profile
 */

import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabsParamList } from '@/types/navigation';
import { WatchlistScreen } from '@/screens/watchlist/WatchlistScreen';
import { PortfolioScreen } from '@/screens/portfolio/PortfolioScreen';
import { TradeScreen } from '@/screens/trade/TradeScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { colors, themeColors } from '@/constants/colors';
import { layout } from '@/constants/layout';

const Tab = createBottomTabNavigator<MainTabsParamList>();

interface TabIconProps {
  icon: string;
}

const TabIcon: React.FC<TabIconProps> = ({ icon }): React.ReactElement => (
  <Text style={{ fontSize: 20 }}>{icon}</Text>
);

export const MainTabs: React.FC = (): React.ReactElement => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.gray500,
        tabBarStyle: {
          backgroundColor: themeColors.dark.secondaryBackground,
          borderTopColor: themeColors.dark.border,
          borderTopWidth: 1,
          height: layout.tabBarHeight,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: layout.fontSize.xs,
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Watchlist"
        component={WatchlistScreen}
        options={{
          tabBarLabel: 'Watchlist',
          tabBarIcon: () => <TabIcon icon="👁" />,
        }}
      />
      <Tab.Screen
        name="Portfolio"
        component={PortfolioScreen}
        options={{
          tabBarLabel: 'Portfolio',
          tabBarIcon: () => <TabIcon icon="📊" />,
        }}
      />
      <Tab.Screen
        name="Trade"
        component={TradeScreen}
        options={{
          tabBarLabel: 'Trade',
          tabBarIcon: () => <TabIcon icon="💹" />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <TabIcon icon="👤" />,
        }}
      />
    </Tab.Navigator>
  );
};
