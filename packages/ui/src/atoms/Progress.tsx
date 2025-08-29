import React from 'react';
import { cn } from '../lib/utils';

export interface ProgressProps {
  value: number; // 0-100
  max?: number;
  className?: string;
  barClassName?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className,
  barClassName,
  showValue = false,
  size = 'md',
  variant = 'default',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const variantClasses = {
    default: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-300 ease-in-out rounded-full',
            variantClasses[variant],
            barClassName
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>

      {showValue && (
        <div className="flex justify-between items-center mt-1 text-xs text-gray-600 dark:text-gray-400">
          <span>{Math.round(percentage)}%</span>
          <span>{value}/{max}</span>
        </div>
      )}
    </div>
  );
};
