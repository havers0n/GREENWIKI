import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as ForumThemeProvider, useTheme } from '@my-forum/ui';
import { useTheme as useReduxTheme } from '../../store/hooks';
import { setTheme } from '../../store/slices/uiSlice';
import { useAppDispatch } from '../../store/hooks';

// Интеграция тем между Redux и нашей UI библиотекой
interface ThemeContextValue {
  mode: 'light' | 'dark' | 'system';
  toggleTheme: () => void;
  setMode: (mode: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return context;
};

interface AppThemeProviderProps {
  children: React.ReactNode;
}

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const reduxTheme = useReduxTheme();

  // Синхронизация тем
  const [mode, setModeState] = useState<'light' | 'dark' | 'system'>(reduxTheme);

  // Синхронизация с Redux
  useEffect(() => {
    setModeState(reduxTheme);
  }, [reduxTheme]);

  const setMode = (newMode: 'light' | 'dark' | 'system') => {
    setModeState(newMode);
    dispatch(setTheme(newMode));
  };

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
  };

  // Определение реальной темы для отображения
  const getResolvedTheme = (): 'light' | 'dark' => {
    if (mode === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return mode;
  };

  const resolvedTheme = getResolvedTheme();

  // Применение темы к документу
  useEffect(() => {
    const root = document.documentElement;

    // Установка атрибута темы
    root.setAttribute('data-theme', resolvedTheme);

    // Установка CSS переменных для совместимости
    const themeVars = {
      light: {
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#f8f9fa',
        '--text-primary': '#212529',
        '--text-secondary': '#6c757d',
        '--border-color': '#dee2e6',
      },
      dark: {
        '--bg-primary': '#1a1a1a',
        '--bg-secondary': '#2d2d2d',
        '--text-primary': '#ffffff',
        '--text-secondary': '#cccccc',
        '--border-color': '#404040',
      },
    };

    const vars = themeVars[resolvedTheme];
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [resolvedTheme]);

  const contextValue: ThemeContextValue = {
    mode,
    toggleTheme,
    setMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <ForumThemeProvider theme={resolvedTheme}>
        <div className={`theme-${resolvedTheme}`}>
          {children}
        </div>
      </ForumThemeProvider>
    </ThemeContext.Provider>
  );
};
