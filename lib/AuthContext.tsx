'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  getCurrentUser,
  loginUser,
  signupUser,
  loginAsGuest,
  logoutUser,
  recordUserConversion,
  updateUserApiKey,
  upgradeUserToPro,
  resetUserCredits,
} from './auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<User>;
  signup: (email: string, password?: string, name?: string) => Promise<User>;
  loginGuest: () => User;
  logout: () => void;
  recordConversion: () => User | null;
  saveApiKey: (key: string) => User | null;
  unlockPro: (planName?: string) => User | null;
  resetCredits: () => User | null;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = () => {
    const current = getCurrentUser();
    setUser(current);
  };

  useEffect(() => {
    refreshUser();
    setIsLoading(false);
  }, []);

  const login = async (email: string, password?: string): Promise<User> => {
    const loggedIn = loginUser(email, password);
    setUser(loggedIn);
    return loggedIn;
  };

  const signup = async (email: string, password?: string, name?: string): Promise<User> => {
    const newUser = signupUser(email, password, name);
    setUser(newUser);
    return newUser;
  };

  const loginGuest = (): User => {
    const guest = loginAsGuest();
    setUser(guest);
    return guest;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const recordConversion = (): User | null => {
    if (!user) return null;
    const updated = recordUserConversion(user.id);
    if (updated) setUser({ ...updated });
    return updated;
  };

  const saveApiKey = (key: string): User | null => {
    if (!user) return null;
    const updated = updateUserApiKey(user.id, key);
    if (updated) setUser({ ...updated });
    return updated;
  };

  const unlockPro = (planName?: string): User | null => {
    if (!user) return null;
    const updated = upgradeUserToPro(user.id, planName);
    if (updated) setUser({ ...updated });
    return updated;
  };

  const resetCredits = (): User | null => {
    if (!user) return null;
    const updated = resetUserCredits(user.id);
    if (updated) setUser({ ...updated });
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        loginGuest,
        logout,
        recordConversion,
        saveApiKey,
        unlockPro,
        resetCredits,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
