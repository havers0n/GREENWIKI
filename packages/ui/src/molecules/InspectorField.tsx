import React from 'react';
import { cn } from '../lib/utils';

export interface InspectorFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const InspectorField = React.memo<InspectorFieldProps>(({
  label,
  hint,
  error,
  required = false,
  children,
  className,
}) => {
  const fieldId = React.useId();

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label
          htmlFor={fieldId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          className: cn(
            (children as React.ReactElement).props.className,
            'w-full'
          ),
        })}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
    </div>
  );
});

InspectorField.displayName = 'InspectorField';
