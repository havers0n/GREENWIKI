import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { Dropdown } from './Dropdown';
import { useThemeToggle } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';

export interface ThemeToggleProps {
  variant?: 'button' | 'dropdown' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'button',
  size = 'md',
  className,
}) => {
  const { theme, toggleTheme, setLightTheme, setDarkTheme, setSystemTheme } = useThemeToggle();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Icon icon={Sun} className="h-4 w-4" />;
      case 'dark':
        return <Icon icon={Moon} className="h-4 w-4" />;
      case 'system':
        return <Icon icon={Monitor} className="h-4 w-4" />;
      default:
        return <Icon icon={Sun} className="h-4 w-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Светлая тема';
      case 'dark':
        return 'Темная тема';
      case 'system':
        return 'Системная тема';
      default:
        return 'Светлая тема';
    }
  };

  if (variant === 'icon-only') {
    return (
      <Button
        variant="ghost"
        size={size}
        onClick={toggleTheme}
        className={cn('p-2', className)}
        title={getThemeLabel()}
      >
        {getThemeIcon()}
        <span className="sr-only">{getThemeLabel()}</span>
      </Button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <Dropdown
        value={theme}
        onChange={(value) => {
          switch (value) {
            case 'light':
              setLightTheme();
              break;
            case 'dark':
              setDarkTheme();
              break;
            case 'system':
              setSystemTheme();
              break;
          }
        }}
        options={[
          {
            value: 'light',
            label: 'Светлая',
            icon: Sun
          },
          {
            value: 'dark',
            label: 'Темная',
            icon: Moon
          },
          {
            value: 'system',
            label: 'Системная',
            icon: Monitor
          },
        ]}
        placeholder="Выберите тему"
        className={className}
      />
    );
  }

  // variant === 'button'
  return (
    <Button
      variant="ghost"
      size={size}
      onClick={toggleTheme}
      className={cn('flex items-center gap-2', className)}
    >
      {getThemeIcon()}
      <span>{getThemeLabel()}</span>
    </Button>
  );
};

// Компонент для быстрого переключения между светлой и темной темой
export const ThemeSwitcher: React.FC<Omit<ThemeToggleProps, 'variant'>> = (props) => {
  const { theme, toggleTheme } = useThemeToggle();

  return (
    <Button
      variant="ghost"
      onClick={toggleTheme}
      className={cn('p-2', props.className)}
      title={`Переключить на ${theme === 'light' ? 'темную' : 'светлую'} тему`}
    >
      {theme === 'light'
        ? <Icon icon={Moon} className="h-4 w-4" />
        : <Icon icon={Sun} className="h-4 w-4" />}
      <span className="sr-only">
        Переключить на {theme === 'light' ? 'темную' : 'светлую'} тему
      </span>
    </Button>
  );
};
