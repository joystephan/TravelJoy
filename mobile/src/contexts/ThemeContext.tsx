import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, Colors } from '../theme/colors';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  colors: Colors & { mode: ThemeMode };
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@traveljoy_theme_mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on mount
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setMode(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      // Default to light mode on error
      setMode('light');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTheme = async (newMode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    saveTheme(newMode);
  };

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setTheme(newMode);
  };

  const colors = mode === 'dark' ? { ...darkColors, mode } : { ...lightColors, mode };

  // Don't render children until theme is loaded to prevent flash
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ mode, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Fallback to light mode if context is not available (backward compatibility)
    return {
      mode: 'light' as ThemeMode,
      colors: lightColors,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
}

