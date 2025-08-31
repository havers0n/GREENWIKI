import React, { forwardRef, useId } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Design tokens types
export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  invalid?: boolean;
  containerClassName?: string;
}

// Utility function for merging classes
const cn = (...classes: (string | undefined | null | false)[]) => {
  return twMerge(clsx(...classes));
};

// Radio styles using design tokens
const radioVariants = {
  base: cn(
    'h-4 w-4',
    'rounded-full',
    'border bg-white dark:bg-gray-800',
    'text-[var(--color-majestic-pink)]',
    'focus:outline-none focus:ring-2 focus:ring-[var(--color-majestic-pink)] focus:ring-offset-2',
    'disabled:opacity-60 disabled:cursor-not-allowed',
    'transition-all duration-200'
  ),
  states: {
    default: cn(
      'border-[var(--color-border-default)]',
      'hover:border-[var(--color-border-hover)]'
    ),
    error: cn(
      'border-red-500'
    ),
  },
};

export const Radio = React.memo(
  forwardRef<HTMLInputElement, RadioProps>(
    (
      {
        label,
        hint,
        error,
        invalid,
        className = '',
        containerClassName = '',
        id,
        required,
        ...props
      },
      ref,
    ) => {
      const reactGeneratedId = useId();
      const inputId = id ?? `radio-${reactGeneratedId}`;
      const isInvalid = Boolean(error) || Boolean(invalid);
      const describedBy = hint || error ? `${inputId}-desc` : undefined;

      return (
        <div className={cn('w-full', containerClassName)}>
          <div className="flex items-start gap-3">
            <input
              id={inputId}
              ref={ref}
              type="radio"
              className={cn(
                radioVariants.base,
                radioVariants.states[isInvalid ? 'error' : 'default'],
                className
              )}
              aria-invalid={isInvalid || undefined}
              aria-describedby={describedBy}
              aria-required={required || undefined}
              required={required}
              {...props}
            />
            {label && (
              <div className="flex-1">
                <label
                  htmlFor={inputId}
                  className={cn(
                    'block text-sm font-medium select-none cursor-pointer',
                    'text-[var(--color-text-primary)]',
                    props.disabled && 'opacity-60 cursor-not-allowed'
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
                {error ? (
                  <p
                    id={describedBy}
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
                    id={describedBy}
                    className={cn(
                      'mt-1 text-xs',
                      'text-[var(--color-text-muted)]'
                    )}
                  >
                    {hint}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </div>
      );
    },
  )
);

Radio.displayName = 'Radio';
