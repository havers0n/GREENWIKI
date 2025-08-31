
import React, { forwardRef, useCallback } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Spinner } from './Spinner';
import { Icon } from './Icon';
import type { LucideProps } from 'lucide-react';

// Design tokens types
export const ButtonVariant = {
  Primary: 'primary',
  Secondary: 'secondary',
  Danger: 'danger',
  Ghost: 'ghost',
} as const;
export type ButtonVariant = typeof ButtonVariant[keyof typeof ButtonVariant];

export const ButtonSize = {
  Xs: 'xs',
  Sm: 'sm',
  Md: 'md',
  Lg: 'lg',
} as const;
export type ButtonSize = typeof ButtonSize[keyof typeof ButtonSize];

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  /** Компонент иконки для левой стороны (из lucide-react) */
  leftIcon?: React.ElementType;
  /** Компонент иконки для правой стороны (из lucide-react) */
  rightIcon?: React.ElementType;
  className?: string;
}

// Utility function for merging classes
const cn = (...classes: (string | undefined | null | false)[]) => {
  return twMerge(clsx(...classes));
};

// Button styles using design tokens
const buttonVariants = {
  base: cn(
    'inline-flex items-center justify-center',
    'font-semibold',
    'rounded-lg',
    'transition-all duration-200',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-60 disabled:cursor-not-allowed',
    'active:scale-[0.98]'
  ),
  variants: {
    variant: {
      [ButtonVariant.Primary]: cn(
        'bg-[var(--color-majestic-pink)] text-white',
        'hover:bg-[var(--color-majestic-pink)]/90',
        'focus-visible:ring-[var(--color-majestic-pink)]',
        'shadow-sm hover:shadow-md'
      ),
      [ButtonVariant.Secondary]: cn(
        'bg-[var(--color-majestic-gray-200)] text-[var(--color-majestic-dark)]',
        'hover:bg-[var(--color-majestic-gray-300)]',
        'focus-visible:ring-[var(--color-majestic-gray-400)]',
        'shadow-sm hover:shadow-md'
      ),
      [ButtonVariant.Danger]: cn(
        'bg-red-600 text-white',
        'hover:bg-red-700',
        'focus-visible:ring-red-600',
        'shadow-sm hover:shadow-md'
      ),
      [ButtonVariant.Ghost]: cn(
        'bg-transparent text-[var(--color-majestic-dark)]',
        'hover:bg-[var(--color-majestic-gray-100)]',
        'focus-visible:ring-[var(--color-majestic-gray-400)]',
        'border border-[var(--color-majestic-gray-300)]',
        'hover:border-[var(--color-majestic-gray-400)]'
      ),
    },
    size: {
      [ButtonSize.Xs]: 'text-xs px-2.5 py-1 gap-1 min-h-[1.5rem]',
      [ButtonSize.Sm]: 'text-sm px-3 py-1.5 gap-1.5 min-h-[2rem]',
      [ButtonSize.Md]: 'text-sm px-4 py-2 gap-2 min-h-[2.5rem]',
      [ButtonSize.Lg]: 'text-base px-5 py-2.5 gap-2.5 min-h-[3rem]',
    },
  },
};

export const Button = React.memo<ButtonProps>(
  forwardRef<HTMLButtonElement, ButtonProps>(
    (
      {
        children,
        variant = ButtonVariant.Primary,
        size = ButtonSize.Md,
        className = '',
        fullWidth = false,
        loading = false,
        leftIcon,
        rightIcon,
        disabled,
        onClick,
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

      const spinnerSize = size === ButtonSize.Xs ? 'sm' : size === ButtonSize.Lg ? 'lg' : 'md';

      return (
        <button
          ref={ref}
          className={cn(
            buttonVariants.base,
            buttonVariants.variants.variant[variant],
            buttonVariants.variants.size[size],
            fullWidth && 'w-full',
            loading && 'cursor-wait',
            className
          )}
          aria-busy={loading || undefined}
          disabled={disabled || loading}
          onClick={handleClick}
          {...props}
        >
          {leftIcon && !loading && (
            <Icon
              icon={leftIcon}
              size={16}
              className="shrink-0"
              aria-hidden
            />
          )}

          {loading && (
            <span className="inline-flex items-center shrink-0" aria-hidden>
              <Spinner size={spinnerSize} />
            </span>
          )}

          {children && (
            <span className="inline-flex items-center">
              {children}
            </span>
          )}

          {rightIcon && !loading && (
            <Icon
              icon={rightIcon}
              size={16}
              className="shrink-0"
              aria-hidden
            />
          )}
        </button>
      );
    },
  )
);

Button.displayName = 'Button';
