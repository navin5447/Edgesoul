'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  getCurrentUser,
  loginLocalUser,
  registerLocalUser,
  logoutLocalUser,
  isUserLoggedIn,
  LocalUser,
} from '@/lib/offline/localAuth';

interface LocalAuthContextType {
  user: LocalUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (username: string, password: string, email?: string, displayName?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const LocalAuthContext = createContext<LocalAuthContextType | undefined>(undefined);

export function LocalAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const result = loginLocalUser(username, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const signup = async (username: string, password: string, email?: string, displayName?: string) => {
    const result = registerLocalUser(username, password, email, displayName);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const logout = () => {
    logoutLocalUser();
    setUser(null);
  };

  const value: LocalAuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: user !== null,
  };

  return (
    <LocalAuthContext.Provider value={value}>
      {children}
    </LocalAuthContext.Provider>
  );
}

export function useLocalAuth() {
  const context = useContext(LocalAuthContext);
  if (context === undefined) {
    throw new Error('useLocalAuth must be used within a LocalAuthProvider');
  }
  return context;
}
