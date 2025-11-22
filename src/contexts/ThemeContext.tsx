import React, { createContext, useContext, useState, useEffect } from 'react';

type ColorTheme = 'green' | 'blue';
type Mode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  colorTheme: ColorTheme;
  mode: Mode;
  setColorTheme: (theme: ColorTheme) => void;
  setMode: (mode: Mode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    const saved = localStorage.getItem('color-theme');
    const theme = (saved === 'blue' || saved === 'green') ? saved : 'green';
    // Set attribute immediately on initialization
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    return theme;
  });

  const [mode, setModeState] = useState<Mode>(() => {
    const saved = localStorage.getItem('theme-mode');
    return (saved === 'light' || saved === 'dark' || saved === 'system') ? saved : 'light';
  });

  // Apply color theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorTheme);
    localStorage.setItem('color-theme', colorTheme);
  }, [colorTheme]);

  // Apply dark/light mode
  useEffect(() => {
    const root = document.documentElement;

    const applyMode = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyMode(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => applyMode(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyMode(mode === 'dark');
    }

    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  const setColorTheme = (theme: ColorTheme) => {
    console.log('🎨 Setting color theme to:', theme);
    // Set attribute and localStorage immediately (synchronously)
    document.documentElement.setAttribute('data-theme', theme);
    console.log('✅ data-theme attribute set:', document.documentElement.getAttribute('data-theme'));
    console.log('📋 classList:', document.documentElement.classList.toString());
    localStorage.setItem('color-theme', theme);
    // Then update React state
    setColorThemeState(theme);
  };

  const setMode = (newMode: Mode) => {
    setModeState(newMode);
  };

  return (
    <ThemeContext.Provider value={{ colorTheme, mode, setColorTheme, setMode }}>
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
