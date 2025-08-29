import React from 'react';
import { cn } from '../lib/utils';

export interface FormFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  hint,
  error,
  required,
  children,
  className,
  style,
  id
}) => {
  const fieldId = id || React.useId();

  return (
    <div className={cn('space-y-1', className)} style={style}>
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
        {React.cloneElement(children as React.ReactElement, { id: fieldId })}
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
};
