import React from 'react';

export const SpinnerSize = {
  Sm: 'sm',
  Md: 'md',
  Lg: 'lg',
} as const;
export type SpinnerSize = typeof SpinnerSize[keyof typeof SpinnerSize];

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = SpinnerSize.Md, className = '', ...props }) => {
  const sizeClasses: Record<SpinnerSize, string> = {
    [SpinnerSize.Sm]: 'h-4 w-4 border-2',
    [SpinnerSize.Md]: 'h-6 w-6 border-2',
    [SpinnerSize.Lg]: 'h-8 w-8 border-2',
  };

  return (
    <span
      role="status"
      aria-label="Загрузка"
      className={`inline-block animate-spin rounded-full border-gray-300 border-t-majestic-pink ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
};


