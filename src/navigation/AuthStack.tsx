/**
 * Authentication stack navigation
 * Handles Login and Signup screens
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/types/navigation';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { SignupScreen } from '@/screens/auth/SignupScreen';
import { colors } from '@/constants/colors';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack: React.FC = (): React.ReactElement => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.darkBg },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          animationEnabled: true,
        }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{
          animationEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
};
