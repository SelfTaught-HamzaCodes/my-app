import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getDarkMode, setDarkMode as setDarkModeStorage } from '../data/storage';

// Light theme: warm off‑white background and soft brown accent used across the app
export const lightColors = {
  background: '#F4EFE7',
  surface: '#FFFFFF',
  surfaceSecondary: '#FAF7F2',
  text: '#2F2F2F',
  textSecondary: '#6A6A6A',
  textMuted: '#8A8580',
  accent: '#C8B79E',
  accentMuted: 'rgba(200, 183, 158, 0.2)',
  border: 'rgba(0,0,0,0.06)',
  danger: '#A85C5C',
  tabBar: '#FAF7F2',
  tabBarBorder: '#E6DFD5',
};

// Dark theme: dark gray surfaces and same accent so the app feels consistent in both modes
export const darkColors = {
  background: '#1A1917',
  surface: '#252422',
  surfaceSecondary: '#2E2D2A',
  text: '#F4EFE7',
  textSecondary: '#B8B4AE',
  textMuted: '#8A8580',
  accent: '#C8B79E',
  accentMuted: 'rgba(200, 183, 158, 0.25)',
  border: 'rgba(255,255,255,0.08)',
  danger: '#D47878',
  tabBar: '#252422',
  tabBarBorder: '#3A3936',
};

export const ThemeContext = createContext({
  isDark: false,
  colors: lightColors,
  setDarkMode: () => {},
});

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [ready, setReady] = useState(false);

  // Load saved theme as soon as the app starts
  useEffect(() => {
    getDarkMode().then(setIsDark).finally(() => setReady(true));
  }, []);

  const setDarkMode = useCallback(async (value) => {
    setIsDark(!!value);
    await setDarkModeStorage(!!value);
  }, []);

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDark, colors, setDarkMode, ready }}>
      {children}
    </ThemeContext.Provider>
  );
}
