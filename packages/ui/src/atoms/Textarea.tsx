import React, { forwardRef, useId } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Design tokens types
export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
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

// Textarea styles using design tokens
const textareaVariants = {
  base: cn(
    'block w-full',
    'rounded-lg',
    'border bg-white dark:bg-gray-800',
    'text-[var(--color-text-primary)]',
    'placeholder-[var(--color-text-muted)]',
    'focus:outline-none focus:ring-2 focus:ring-[var(--color-majestic-pink)] focus:ring-offset-2',
    'disabled:opacity-60 disabled:cursor-not-allowed',
    'transition-all duration-200',
    'resize-y' // Only vertical resize by default
  ),
  states: {
    default: cn(
      'border-[var(--color-border-default)]',
      'hover:border-[var(--color-border-hover)]'
    ),
    error: cn(
      'border-red-500',
      'focus:ring-red-500'
    ),
  },
};

export const Textarea = React.memo(
  forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
      {
        label,
        hint,
        error,
        invalid,
        className = '',
        containerClassName = '',
        id,
        rows = 6,
        required,
        ...props
      },
      ref,
    ) => {
      const reactGeneratedId = useId();
      const textareaId = id ?? `textarea-${reactGeneratedId}`;
      const isInvalid = Boolean(error) || Boolean(invalid);
      const describedBy = hint || error ? `${textareaId}-desc` : undefined;

      return (
        <div className={cn('w-full', containerClassName)}>
          {label && (
            <label
              htmlFor={textareaId}
              className={cn(
                'mb-1 block text-sm font-medium select-none cursor-pointer',
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
          )}
          <textarea
            id={textareaId}
            ref={ref}
            rows={rows}
            className={cn(
              textareaVariants.base,
              textareaVariants.states[isInvalid ? 'error' : 'default'],
              className
            )}
            aria-invalid={isInvalid || undefined}
            aria-describedby={describedBy}
            aria-required={required || undefined}
            required={required}
            {...props}
          />
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
      );
    },
  )
);

Textarea.displayName = 'Textarea';


