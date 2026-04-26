/**
 * Root navigator - handles auth state and navigates to appropriate stack
 * If authenticated: shows MainTabs
 * If not authenticated: shows AuthStack
 */

import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  linking?: LinkingOptions<RootStackParamList>;
}

export const RootNavigator: React.FC<RootNavigatorProps> = ({ linking }): React.ReactElement => {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} options={{ animation: 'none' }} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} options={{ animation: 'none' }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
