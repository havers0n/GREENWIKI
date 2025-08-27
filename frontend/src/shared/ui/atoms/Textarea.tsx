import React, { forwardRef, useId } from 'react';

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
  invalid?: boolean;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, hint, error, invalid, className = '', containerClassName = '', id, rows = 6, ...props },
    ref,
  ) => {
    const reactGeneratedId = useId();
    const textareaId = id ?? `textarea-${reactGeneratedId}`;
    const isInvalid = Boolean(error) || Boolean(invalid);

    const baseStyles =
      'block w-full rounded-lg border bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ' +
      'focus:outline-none focus:ring-2 focus:ring-majestic-pink focus:border-majestic-pink ' +
      'disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed dark:disabled:bg-gray-700 dark:disabled:text-gray-500 resize-y';

    const validStyles = 'border-majestic-gray-300 dark:border-gray-700';
    const invalidStyles = 'border-red-500 text-red-900 dark:text-red-300 placeholder-red-400 focus:ring-red-500 focus:border-red-500';

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={textareaId} className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={`${baseStyles} ${isInvalid ? invalidStyles : validStyles} ${className}`}
          aria-invalid={isInvalid || undefined}
          aria-describedby={hint || error ? `${textareaId}-desc` : undefined}
          {...props}
        />
        {error ? (
          <p id={`${textareaId}-desc`} className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : hint ? (
          <p id={`${textareaId}-desc`} className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';


