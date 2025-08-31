import React, { forwardRef, useCallback } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Spinner } from './Spinner';

// Design tokens types
export const ActionIconVariant = {
  Filled: 'filled',
  Light: 'light',
  Outline: 'outline',
  Subtle: 'subtle',
} as const;
export type ActionIconVariant = typeof ActionIconVariant[keyof typeof ActionIconVariant];

export const ActionIconSize = {
  Xs: 'xs',
  Sm: 'sm',
  Md: 'md',
  Lg: 'lg',
} as const;
export type ActionIconSize = typeof ActionIconSize[keyof typeof ActionIconSize];

export const ActionIconColor = {
  Primary: 'primary',
  Secondary: 'secondary',
  Danger: 'danger',
  Success: 'success',
} as const;
export type ActionIconColor = typeof ActionIconColor[keyof typeof ActionIconColor];

export interface ActionIconProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  children: React.ReactNode;
  variant?: ActionIconVariant;
  size?: ActionIconSize;
  color?: ActionIconColor;
  loading?: boolean;
  'aria-label': string; // Required for accessibility
  className?: string;
}

// Utility function for merging classes
const cn = (...classes: (string | undefined | null | false)[]) => {
  return twMerge(clsx(...classes));
};

// ActionIcon styles using design tokens
const actionIconVariants = {
  base: cn(
    'inline-flex items-center justify-center',
    'aspect-square rounded-lg',
    'font-medium',
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-60 disabled:cursor-not-allowed',
    'active:scale-[0.95]',
    'relative overflow-hidden'
  ),
  variants: {
    variant: {
      [ActionIconVariant.Filled]: {
        [ActionIconColor.Primary]: cn(
          'bg-[var(--color-majestic-pink)] text-white',
          'hover:bg-[var(--color-majestic-pink)]/90',
          'focus-visible:ring-[var(--color-majestic-pink)]',
          'shadow-sm hover:shadow-md'
        ),
        [ActionIconColor.Secondary]: cn(
          'bg-[var(--color-majestic-gray-200)] text-[var(--color-text-primary)]',
          'hover:bg-[var(--color-majestic-gray-300)]',
          'focus-visible:ring-[var(--color-majestic-gray-400)]',
          'shadow-sm hover:shadow-md'
        ),
        [ActionIconColor.Danger]: cn(
          'bg-red-600 text-white',
          'hover:bg-red-700',
          'focus-visible:ring-red-600',
          'shadow-sm hover:shadow-md'
        ),
        [ActionIconColor.Success]: cn(
          'bg-green-600 text-white',
          'hover:bg-green-700',
          'focus-visible:ring-green-600',
          'shadow-sm hover:shadow-md'
        ),
      },
      [ActionIconVariant.Light]: {
        [ActionIconColor.Primary]: cn(
          'bg-[var(--color-majestic-pink)]/10 text-[var(--color-majestic-pink)]',
          'hover:bg-[var(--color-majestic-pink)]/20',
          'focus-visible:ring-[var(--color-majestic-pink)]',
          'border border-[var(--color-majestic-pink)]/20'
        ),
        [ActionIconColor.Secondary]: cn(
          'bg-[var(--color-majestic-gray-100)] text-[var(--color-majestic-gray-700)]',
          'hover:bg-[var(--color-majestic-gray-200)]',
          'focus-visible:ring-[var(--color-majestic-gray-400)]',
          'border border-[var(--color-majestic-gray-300)]'
        ),
        [ActionIconColor.Danger]: cn(
          'bg-red-50 text-red-600',
          'hover:bg-red-100',
          'focus-visible:ring-red-500',
          'border border-red-200'
        ),
        [ActionIconColor.Success]: cn(
          'bg-green-50 text-green-600',
          'hover:bg-green-100',
          'focus-visible:ring-green-500',
          'border border-green-200'
        ),
      },
      [ActionIconVariant.Outline]: {
        [ActionIconColor.Primary]: cn(
          'bg-transparent text-[var(--color-majestic-pink)]',
          'border-2 border-[var(--color-majestic-pink)]',
          'hover:bg-[var(--color-majestic-pink)] hover:text-white',
          'focus-visible:ring-[var(--color-majestic-pink)]'
        ),
        [ActionIconColor.Secondary]: cn(
          'bg-transparent text-[var(--color-majestic-gray-700)]',
          'border-2 border-[var(--color-majestic-gray-400)]',
          'hover:bg-[var(--color-majestic-gray-100)]',
          'focus-visible:ring-[var(--color-majestic-gray-400)]'
        ),
        [ActionIconColor.Danger]: cn(
          'bg-transparent text-red-600',
          'border-2 border-red-300',
          'hover:bg-red-50',
          'focus-visible:ring-red-500'
        ),
        [ActionIconColor.Success]: cn(
          'bg-transparent text-green-600',
          'border-2 border-green-300',
          'hover:bg-green-50',
          'focus-visible:ring-green-500'
        ),
      },
      [ActionIconVariant.Subtle]: {
        [ActionIconColor.Primary]: cn(
          'bg-transparent text-[var(--color-majestic-pink)]',
          'hover:bg-[var(--color-majestic-pink)]/10',
          'focus-visible:ring-[var(--color-majestic-pink)]',
          'hover:text-[var(--color-majestic-pink)]/80'
        ),
        [ActionIconColor.Secondary]: cn(
          'bg-transparent text-[var(--color-majestic-gray-600)]',
          'hover:bg-[var(--color-majestic-gray-100)]',
          'focus-visible:ring-[var(--color-majestic-gray-400)]',
          'hover:text-[var(--color-majestic-gray-800)]'
        ),
        [ActionIconColor.Danger]: cn(
          'bg-transparent text-red-500',
          'hover:bg-red-50',
          'focus-visible:ring-red-500',
          'hover:text-red-700'
        ),
        [ActionIconColor.Success]: cn(
          'bg-transparent text-green-500',
          'hover:bg-green-50',
          'focus-visible:ring-green-500',
          'hover:text-green-700'
        ),
      },
    },
    size: {
      [ActionIconSize.Xs]: 'w-6 h-6 text-xs',
      [ActionIconSize.Sm]: 'w-8 h-8 text-sm',
      [ActionIconSize.Md]: 'w-10 h-10 text-base',
      [ActionIconSize.Lg]: 'w-12 h-12 text-lg',
    },
  },
};

export const ActionIcon = React.memo<ActionIconProps>(
  forwardRef<HTMLButtonElement, ActionIconProps>(
    (
      {
        children,
        variant = ActionIconVariant.Light,
        size = ActionIconSize.Md,
        color = ActionIconColor.Primary,
        className = '',
        loading = false,
        disabled,
        onClick,
        'aria-label': ariaLabel,
        ...props
      },
      ref,
    ) => {
      const handleClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
          if (loading || disabled) return;
          onClick?.(event);
        },
        [onClick, loading, disabled]
      );

      const spinnerSize = size === ActionIconSize.Sm ? 'sm' : size === ActionIconSize.Lg ? 'lg' : 'md';

      return (
        <button
          ref={ref}
          className={cn(
            actionIconVariants.base,
            actionIconVariants.variants.variant[variant][color],
            actionIconVariants.variants.size[size],
            loading && 'cursor-wait',
            className
          )}
          aria-busy={loading || undefined}
          aria-label={ariaLabel}
          disabled={disabled || loading}
          onClick={handleClick}
          {...props}
        >
          {loading ? (
            <Spinner size={spinnerSize} className="text-current" />
          ) : (
            <span className="inline-flex items-center justify-center w-full h-full" aria-hidden="true">
              {children}
            </span>
          )}
        </button>
      );
    },
  )
);

ActionIcon.displayName = 'ActionIcon';
