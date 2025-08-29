import React, { forwardRef, useId } from 'react';

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

export const Input = forwardRef<HTMLInputElement, InputProps>(
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

    const baseStyles =
      'block w-full rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ' +
      'focus:outline-none focus:ring-2 focus:ring-majestic-pink focus:border-majestic-pink ' +
      'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-700 dark:disabled:text-gray-500';

    const sizeStyles: Record<InputSize, string> = {
      [InputSize.Sm]: 'text-sm px-3 py-1.5',
      [InputSize.Md]: 'text-sm px-4 py-2',
      [InputSize.Lg]: 'text-base px-5 py-2.5',
    };

    const validStyles = 'border-majestic-gray-300 dark:border-gray-700';
    const invalidStyles = 'border-red-500 text-red-900 dark:text-red-300 placeholder-red-400 focus:ring-red-500 focus:border-red-500';

    const describedById = hint || error ? `${inputId}-desc` : undefined;

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required ? <span className="ml-1 text-red-600" aria-hidden>*</span> : null}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`${baseStyles} ${sizeStyles[size]} ${isInvalid ? invalidStyles : validStyles} ${className}`}
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedById}
          aria-required={required || undefined}
          required={required}
          {...props}
        />
        {error ? (
          <p id={describedById} className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : hint ? (
          <p id={describedById} className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';


