'use client';
import { User } from '@ibiri/db';
import { getCurrentUser, logout as apiLogout } from '@ibiri/utils';
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  loginContext: (user: User) => void;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
      } else {
        console.error('Failed to refresh user data');
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const loginContext = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    apiLogout();
  };

  const updateUser = (updatedUser: Partial<User>) => {
    setUser(prevUser => prevUser ? ({ ...prevUser, ...updatedUser } as User) : null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, updateUser, loading, loginContext, logout, refreshUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
