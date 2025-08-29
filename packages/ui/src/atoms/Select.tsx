import React, { forwardRef, useId } from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  invalid?: boolean;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, hint, error, invalid, className = '', containerClassName = '', id, children, ...props },
    ref,
  ) => {
    const reactGeneratedId = useId();
    const selectId = id ?? `select-${reactGeneratedId}`;
    const isInvalid = Boolean(error) || Boolean(invalid);

    const baseStyles =
      'block w-full rounded-lg border bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 ' +
      'focus:outline-none focus:ring-2 focus:ring-majestic-pink focus:border-majestic-pink ' +
      'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-700 dark:disabled:text-gray-500';

    const validStyles = 'border-majestic-gray-300 dark:border-gray-700';
    const invalidStyles = 'border-red-500 text-red-900 dark:text-red-300 focus:ring-red-500 focus:border-red-500';

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`${baseStyles} ${isInvalid ? invalidStyles : validStyles} ${className}`}
          aria-invalid={isInvalid || undefined}
          aria-describedby={hint || error ? `${selectId}-desc` : undefined}
          {...props}
        >
          {children}
        </select>
        {error ? (
          <p id={`${selectId}-desc`} className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : hint ? (
          <p id={`${selectId}-desc`} className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = 'Select';


