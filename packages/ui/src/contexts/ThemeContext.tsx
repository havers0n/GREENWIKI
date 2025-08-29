import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  attribute = 'data-theme',
}) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Загружаем тему из localStorage при монтировании
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem(storageKey) as Theme;
      if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
        setTheme(storedTheme);
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }
  }, [storageKey]);

  // Определяем реальную тему на основе системных настроек
  useEffect(() => {
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setResolvedTheme(systemTheme);
      } else {
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();

    // Слушаем изменения системной темы
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateResolvedTheme();

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Применяем тему к документу
  useEffect(() => {
    const root = document.documentElement;

    // Устанавливаем атрибут темы
    root.setAttribute(attribute, resolvedTheme);

    // Устанавливаем CSS переменные для темы
    const themeTokens = {
      light: {
        '--color-bg-primary': '#ffffff',
        '--color-bg-secondary': '#f8f9fa',
        '--color-bg-tertiary': '#e9ecef',
        '--color-text-primary': '#212529',
        '--color-text-secondary': '#6c757d',
        '--color-text-muted': '#adb5bd',
        '--color-border-default': '#dee2e6',
        '--color-border-hover': '#ced4da',
      },
      dark: {
        '--color-bg-primary': '#1a1a1a',
        '--color-bg-secondary': '#2d2d2d',
        '--color-bg-tertiary': '#404040',
        '--color-text-primary': '#ffffff',
        '--color-text-secondary': '#cccccc',
        '--color-text-muted': '#888888',
        '--color-border-default': '#404040',
        '--color-border-hover': '#555555',
      },
    };

    const tokens = themeTokens[resolvedTheme];
    Object.entries(tokens).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }, [resolvedTheme, attribute]);

  // Сохраняем тему в localStorage при изменении
  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  };

  const value: ThemeContextValue = {
    theme,
    setTheme: handleSetTheme,
    resolvedTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Хук для переключения темы
export const useThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');
  const setSystemTheme = () => setTheme('system');

  return {
    theme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
  };
};
