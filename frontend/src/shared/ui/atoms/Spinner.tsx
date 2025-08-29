import React from 'react';
import { cn } from '../../lib/utils';

export const SpinnerSize = {
  Xs: 'xs',
  Sm: 'sm',
  Md: 'md',
  Lg: 'lg',
  Xl: 'xl',
} as const;
export type SpinnerSize = typeof SpinnerSize[keyof typeof SpinnerSize];

export const SpinnerVariant = {
  Default: 'default',
  Primary: 'primary',
  Secondary: 'secondary',
  Success: 'success',
  Warning: 'warning',
  Error: 'error',
} as const;
export type SpinnerVariant = typeof SpinnerVariant[keyof typeof SpinnerVariant];

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  showLabel?: boolean;
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = SpinnerSize.Md,
  variant = SpinnerVariant.Default,
  showLabel = false,
  label = 'Загрузка...',
  className = '',
  ...props
}) => {
  const sizeClasses: Record<SpinnerSize, string> = {
    [SpinnerSize.Xs]: 'h-3 w-3 border',
    [SpinnerSize.Sm]: 'h-4 w-4 border-2',
    [SpinnerSize.Md]: 'h-6 w-6 border-2',
    [SpinnerSize.Lg]: 'h-8 w-8 border-2',
    [SpinnerSize.Xl]: 'h-12 w-12 border-3',
  };

  const variantClasses: Record<SpinnerVariant, string> = {
    [SpinnerVariant.Default]: 'border-gray-300 border-t-blue-500',
    [SpinnerVariant.Primary]: 'border-blue-200 border-t-blue-600',
    [SpinnerVariant.Secondary]: 'border-gray-200 border-t-gray-600',
    [SpinnerVariant.Success]: 'border-green-200 border-t-green-600',
    [SpinnerVariant.Warning]: 'border-yellow-200 border-t-yellow-600',
    [SpinnerVariant.Error]: 'border-red-200 border-t-red-600',
  };

  const spinner = (
    <span
      role="status"
      aria-label={showLabel ? undefined : "Загрузка"}
      className={cn(
        'inline-block animate-spin rounded-full',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );

  if (showLabel) {
    return (
      <div className="flex items-center space-x-2">
        {spinner}
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {label}
        </span>
      </div>
    );
  }

  return spinner;
};

/**
 * Компонент для отображения состояния загрузки с оверлеем
 */
export const LoadingOverlay: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
  className?: string;
}> = ({ isLoading, children, message = 'Загрузка...', className }) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className={cn('relative', className)}>
      {children}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 rounded-md">
        <div className="flex flex-col items-center space-y-2">
          <Spinner size={SpinnerSize.Lg} variant={SpinnerVariant.Primary} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Компонент для отображения состояния загрузки страницы
 */
export const PageLoader: React.FC<{
  message?: string;
  className?: string;
}> = ({ message = 'Загрузка страницы...', className }) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center min-h-[400px] space-y-4',
      className
    )}>
      <Spinner size={SpinnerSize.Xl} variant={SpinnerVariant.Primary} />
      <span className="text-lg text-gray-600 dark:text-gray-400">
        {message}
      </span>
    </div>
  );
};


