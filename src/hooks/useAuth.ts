/**
 * Mock authentication hook for testing navigation flows
 * TODO: Replace with actual authentication logic when backend is ready
 */

import { useState, useCallback } from 'react';
import { AuthContextType, User } from '@/types/navigation';

export const useAuth = (): AuthContextType => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, _password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock user object
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
      };

      setUser(mockUser);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, _password: string, name: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockUser: User = {
        id: '1',
        email,
        name,
      };

      setUser(mockUser);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isAuthenticated,
    user,
    login,
    logout,
    signup,
    isLoading,
  };
};
