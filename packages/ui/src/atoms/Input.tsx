import React, { forwardRef, useId } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Design tokens types
export const InputSize = {
  Sm: 'sm',
  Md: 'md',
  Lg: 'lg',
} as const;
export type InputSize = typeof InputSize[keyof typeof InputSize];

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  invalid?: boolean;
  size?: InputSize;
  containerClassName?: string;
}

// Utility function for merging classes
const cn = (...classes: (string | undefined | null | false)[]) => {
  return twMerge(clsx(...classes));
};

// Input styles using design tokens
const inputVariants = {
  base: cn(
    'block w-full',
    'rounded-lg',
    'border bg-white dark:bg-gray-800',
    'text-[var(--color-text-primary)]',
    'placeholder-[var(--color-text-muted)]',
    'focus:outline-none focus:ring-2 focus:ring-[var(--color-majestic-pink)] focus:border-[var(--color-majestic-pink)]',
    'disabled:bg-[var(--color-bg-tertiary)] disabled:text-[var(--color-text-muted)] disabled:cursor-not-allowed',
    'transition-all duration-200'
  ),
  states: {
    default: cn(
      'border-[var(--color-border-default)]',
      'hover:border-[var(--color-border-hover)]',
      'focus:border-[var(--color-majestic-pink)]'
    ),
    error: cn(
      'border-red-500 text-red-900 dark:text-red-300',
      'placeholder-red-400',
      'focus:ring-red-500 focus:border-red-500'
    ),
  },
  sizes: {
    [InputSize.Sm]: 'text-sm px-3 py-1.5 min-h-[2rem]',
    [InputSize.Md]: 'text-sm px-4 py-2 min-h-[2.5rem]',
    [InputSize.Lg]: 'text-base px-5 py-2.5 min-h-[3rem]',
  },
};

export const Input = React.memo<InputProps>(
  forwardRef<HTMLInputElement, InputProps>(
    (
      {
        label,
        hint,
        error,
        invalid,
        size = InputSize.Md,
        className = '',
        containerClassName = '',
        id,
        required,
        ...props
      },
      ref,
    ) => {
      const reactGeneratedId = useId();
      const inputId = id ?? `input-${reactGeneratedId}`;

      const isInvalid = Boolean(error) || Boolean(invalid);
      const describedById = hint || error ? `${inputId}-desc` : undefined;

      return (
        <div className={cn('w-full', containerClassName)}>
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                'mb-1 block font-medium',
                'text-[var(--color-text-secondary)]',
                inputVariants.sizes[size]?.includes('text-base') ? 'text-base' : 'text-sm'
              )}
            >
              {label}
              {required ? (
                <span
                  className="ml-1 text-red-600 dark:text-red-400"
                  aria-hidden="true"
                >
                  *
                </span>
              ) : null}
            </label>
          )}

          <input
            id={inputId}
            ref={ref}
            className={cn(
              inputVariants.base,
              inputVariants.sizes[size],
              isInvalid ? inputVariants.states.error : inputVariants.states.default,
              className
            )}
            aria-invalid={isInvalid || undefined}
            aria-describedby={describedById}
            aria-required={required || undefined}
            required={required}
            {...props}
          />

          {error ? (
            <p
              id={describedById}
              className={cn(
                'mt-1 text-sm',
                'text-red-600 dark:text-red-400'
              )}
              role="alert"
            >
              {error}
            </p>
          ) : hint ? (
            <p
              id={describedById}
              className={cn(
                'mt-1',
                'text-[var(--color-text-muted)]',
                inputVariants.sizes[size]?.includes('text-base') ? 'text-sm' : 'text-xs'
              )}
            >
              {hint}
            </p>
          ) : null}
        </div>
      );
    },
  )
);

Input.displayName = 'Input';


