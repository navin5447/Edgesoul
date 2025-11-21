'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { GenderType, ThemeConfig, getTheme, getThemeVariables } from '@/lib/themes';

interface ThemeContextType {
  theme: ThemeConfig;
  gender: GenderType;
  setGender: (gender: GenderType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [gender, setGenderState] = useState<GenderType>('not_set');
  const [theme, setTheme] = useState<ThemeConfig>(getTheme('not_set'));

  // Load gender from localStorage on mount
  useEffect(() => {
    const savedGender = localStorage.getItem('user_gender') as GenderType;
    if (savedGender) {
      setGenderState(savedGender);
      setTheme(getTheme(savedGender));
    }
  }, []);

  // Apply theme CSS variables to document
  useEffect(() => {
    const variables = getThemeVariables(theme);
    const root = document.documentElement;
    
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [theme]);

  const setGender = (newGender: GenderType) => {
    setGenderState(newGender);
    setTheme(getTheme(newGender));
    localStorage.setItem('user_gender', newGender);
  };

  return (
    <ThemeContext.Provider value={{ theme, gender, setGender }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
