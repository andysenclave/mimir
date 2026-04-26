/**
 * Typed navigation parameters for all screens
 */

import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack Params
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

// Main Tabs Param List
export type MainTabsParamList = {
  Watchlist: undefined;
  Portfolio: undefined;
  Trade: undefined;
  Profile: undefined;
};

// Root Stack Param List
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabsParamList>;
};

// User type
export interface User {
  id: string;
  email: string;
  name: string;
}

// Auth Context type
export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  isLoading: boolean;
}
