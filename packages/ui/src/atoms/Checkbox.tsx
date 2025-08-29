import React, { forwardRef, useId } from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: string;
  hint?: string;
  error?: string;
  invalid?: boolean;
  containerClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, hint, error, invalid, className = '', containerClassName = '', id, required, ...props }, ref) => {
    const reactGeneratedId = useId();
    const inputId = id ?? `checkbox-${reactGeneratedId}`;
    const isInvalid = Boolean(error) || Boolean(invalid);

    return (
      <div className={`w-full ${containerClassName}`}>
        <div className="flex items-start gap-2">
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            className={`h-4 w-4 rounded border-majestic-gray-300 text-majestic-pink focus:ring-majestic-pink ${className}`}
            aria-invalid={isInvalid || undefined}
            aria-describedby={hint || error ? `${inputId}-desc` : undefined}
            aria-required={required || undefined}
            required={required}
            {...props}
          />
          {label && (
            <label htmlFor={inputId} className="text-sm text-gray-700 dark:text-gray-300 select-none">
              {label}
              {required ? <span className="ml-1 text-red-600" aria-hidden>*</span> : null}
            </label>
          )}
        </div>
        {error ? (
          <p id={`${inputId}-desc`} className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-desc`} className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
