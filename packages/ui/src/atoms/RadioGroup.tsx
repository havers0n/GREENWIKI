import React, { createContext, useContext, useId } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Radio, RadioProps } from './Radio';

// Utility function for merging classes
const cn = (...classes: (string | undefined | null | false)[]) => {
  return twMerge(clsx(...classes));
};

// RadioGroup Context
interface RadioGroupContextValue {
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

const RadioGroupContext = createContext<RadioGroupContextValue>({});

// Hook for using RadioGroup context
export const useRadioGroup = () => {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error('Radio must be used within a RadioGroup');
  }
  return context;
};

// RadioGroup Props
export interface RadioGroupProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  children: React.ReactNode;
  containerClassName?: string;
  orientation?: 'vertical' | 'horizontal';
}

// RadioGroup Component
export const RadioGroup = React.memo<RadioGroupProps>(
  ({
    label,
    value,
    onChange,
    error,
    disabled = false,
    required = false,
    children,
    containerClassName = '',
    orientation = 'vertical',
  }) => {
    const reactGeneratedId = useId();
    const groupId = `radio-group-${reactGeneratedId}`;
    const name = `radio-group-${reactGeneratedId}`;

    const contextValue: RadioGroupContextValue = {
      name,
      value,
      onChange,
      disabled,
      error,
    };

    return (
      <fieldset
        className={cn('w-full', containerClassName)}
        role="radiogroup"
        aria-labelledby={label ? `${groupId}-label` : undefined}
        aria-describedby={error ? `${groupId}-error` : undefined}
        aria-required={required}
      >
        {label && (
          <legend
            id={`${groupId}-label`}
            className={cn(
              'mb-2 block text-sm font-medium',
              'text-[var(--color-text-primary)]'
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
          </legend>
        )}

        <div
          className={cn(
            'space-y-2',
            orientation === 'horizontal' && 'flex gap-4 space-y-0'
          )}
        >
          <RadioGroupContext.Provider value={contextValue}>
            {children}
          </RadioGroupContext.Provider>
        </div>

        {error && (
          <p
            id={`${groupId}-error`}
            className={cn(
              'mt-2 text-sm',
              'text-red-600 dark:text-red-400'
            )}
            role="alert"
          >
            {error}
          </p>
        )}
      </fieldset>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

// RadioGroupItem Component for easier usage
interface RadioGroupItemProps extends Omit<RadioProps, 'name' | 'checked' | 'onChange' | 'disabled' | 'error'> {
  value: string;
}

export const RadioGroupItem = React.memo<RadioGroupItemProps>(
  ({ value, ...props }) => {
    const { name, value: selectedValue, onChange, disabled, error } = useRadioGroup();

    return (
      <Radio
        name={name}
        checked={selectedValue === value}
        onChange={() => onChange?.(value)}
        disabled={disabled}
        error={error}
        {...props}
      />
    );
  }
);

RadioGroupItem.displayName = 'RadioGroupItem';
