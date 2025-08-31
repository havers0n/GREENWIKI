import React from 'react';
import { FileX, Search, Package } from 'lucide-react';
import { Typography } from '../atoms/Typography';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { cn } from '../lib/utils';

export interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: IconComponent,
  title,
  description,
  action,
  className,
  size = 'md',
}) => {
  // Default icons based on common use cases
  const getDefaultIcon = () => {
    if (title.toLowerCase().includes('поиск') || title.toLowerCase().includes('search')) {
      return Search;
    }
    if (title.toLowerCase().includes('пуст') || title.toLowerCase().includes('empty')) {
      return Package;
    }
    return FileX;
  };

  const icon = IconComponent || getDefaultIcon();

  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'h-8 w-8',
      title: 'h4',
      description: 'body2',
      spacing: 'space-y-3',
    },
    md: {
      container: 'py-12',
      icon: 'h-12 w-12',
      title: 'h3',
      description: 'body',
      spacing: 'space-y-4',
    },
    lg: {
      container: 'py-16',
      icon: 'h-16 w-16',
      title: 'h2',
      description: 'body',
      spacing: 'space-y-6',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      classes.container,
      classes.spacing,
      className
    )}>
      <div className={cn(
        'text-gray-400 dark:text-gray-500 mb-4',
        size === 'sm' && 'mb-3',
        size === 'lg' && 'mb-6'
      )}>
        {React.createElement(icon as any, { className: classes.icon })}
      </div>

      <Typography
        variant={classes.title as any}
        className="text-gray-900 dark:text-gray-100"
      >
        {title}
      </Typography>

      {description && (
        <Typography
          variant={classes.description as any}
          className="text-gray-500 dark:text-gray-400 max-w-md"
        >
          {description}
        </Typography>
      )}

      {action && (
        <div className="mt-4">
          <Button
            onClick={action.onClick}
            variant={action.variant || 'primary'}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
};

// Specific empty state components
export const EmptyBlocksLibrary: React.FC<Omit<EmptyStateProps, 'icon' | 'title' | 'description'>> = (props) => (
  <EmptyState
    icon={Package as any}
    title="Библиотека блоков пуста"
    description="Создайте свой первый переиспользуемый блок, чтобы начать работу с библиотекой компонентов."
    {...props}
  />
);

export const EmptySearchResults: React.FC<Omit<EmptyStateProps, 'icon' | 'title' | 'description'>> = (props) => (
  <EmptyState
    icon={Search as any}
    title="Ничего не найдено"
    description="Попробуйте изменить поисковый запрос или фильтры для получения результатов."
    {...props}
  />
);

export { EmptyState };
