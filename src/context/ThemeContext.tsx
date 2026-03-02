// ===============================
// THEME CONTEXT - PRESUPUESTOS APP
// ===============================

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  COLORS,
  getTextColor,
  getBackgroundColor,
  getSurfaceColor,
  getBorderColor,
} from '../constants/colors';
import { STORAGE_CONFIG } from '../constants/config';

// ===============================
// TYPES
// ===============================

interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  border: string;
  borderSecondary: string;
  separator: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  success: string;
  error: string;
  warning: string;
  info: string;
}

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

// ===============================
// CONTEXT
// ===============================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ===============================
// PROVIDER
// ===============================

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_CONFIG.KEYS.THEME);
      if (stored !== null) {
        setIsDark(stored === 'dark');
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('Error loading theme:', error);
      }
    }
  };

  const toggleTheme = useCallback(async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    try {
      await AsyncStorage.setItem(STORAGE_CONFIG.KEYS.THEME, newValue ? 'dark' : 'light');
    } catch (error) {
      if (__DEV__) {
        console.warn('Error saving theme:', error);
      }
    }
  }, [isDark]);

  const colors = useMemo<ThemeColors>(() => {
    const bg = getBackgroundColor(isDark);
    const surface = getSurfaceColor(isDark);
    const text = getTextColor(isDark);
    const border = getBorderColor(isDark);

    return {
      background: bg.primary,
      backgroundSecondary: bg.secondary,
      surface: surface.primary,
      surfaceSecondary: surface.secondary,
      text: text.primary,
      textSecondary: text.secondary,
      textTertiary: text.tertiary,
      textDisabled: text.disabled,
      border: border.primary,
      borderSecondary: border.secondary,
      separator: border.separator,
      primary: COLORS.primary,
      primaryLight: COLORS.primaryLight,
      primaryDark: COLORS.primaryDark,
      success: COLORS.success,
      error: COLORS.error,
      warning: COLORS.warning,
      info: COLORS.info,
    };
  }, [isDark]);

  const value = useMemo(() => ({ isDark, toggleTheme, colors }), [isDark, toggleTheme, colors]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// ===============================
// HOOK
// ===============================

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
