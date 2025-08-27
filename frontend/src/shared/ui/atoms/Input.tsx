import React, { forwardRef, useId } from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  invalid?: boolean;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      invalid,
      className = '',
      containerClassName = '',
      id,
      ...props
    },
    ref,
  ) => {
    const reactGeneratedId = useId();
    const inputId = id ?? `input-${reactGeneratedId}`;

    const isInvalid = Boolean(error) || Boolean(invalid);

    const baseStyles =
      'block w-full rounded-lg border bg-white text-sm text-gray-900 placeholder-gray-400 ' +
      'focus:outline-none focus:ring-2 focus:ring-majestic-pink focus:border-majestic-pink ' +
      'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed';

    const validStyles = 'border-majestic-gray-300';
    const invalidStyles = 'border-red-500 text-red-900 placeholder-red-400 focus:ring-red-500 focus:border-red-500';

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`${baseStyles} ${isInvalid ? invalidStyles : validStyles} ${className}`}
          aria-invalid={isInvalid || undefined}
          aria-describedby={hint || error ? `${inputId}-desc` : undefined}
          {...props}
        />
        {error ? (
          <p id={`${inputId}-desc`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-desc`} className="mt-1 text-xs text-gray-500">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';


