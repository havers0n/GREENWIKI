import React, { forwardRef, useId } from 'react';

export const SwitchSize = { Sm: 'sm', Md: 'md', Lg: 'lg' } as const;
export type SwitchSize = typeof SwitchSize[keyof typeof SwitchSize];

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: string;
  hint?: string;
  error?: string;
  invalid?: boolean;
  size?: SwitchSize;
  containerClassName?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      hint,
      error,
      invalid,
      size = SwitchSize.Md,
      className = '',
      containerClassName = '',
      id,
      required,
      ...props
    },
    ref,
  ) => {
    const reactGeneratedId = useId();
    const inputId = id ?? `switch-${reactGeneratedId}`;
    const isInvalid = Boolean(error) || Boolean(invalid);

    const track: Record<SwitchSize, string> = {
      [SwitchSize.Sm]: 'w-9 h-4',
      [SwitchSize.Md]: 'w-11 h-5',
      [SwitchSize.Lg]: 'w-14 h-6',
    };
    const knob: Record<SwitchSize, string> = {
      [SwitchSize.Sm]: 'w-3 h-3 translate-x-0.5 peer-checked:translate-x-5',
      [SwitchSize.Md]: 'w-4 h-4 translate-x-0.5 peer-checked:translate-x-6',
      [SwitchSize.Lg]: 'w-5 h-5 translate-x-0.5 peer-checked:translate-x-8',
    };

    return (
      <div className={`w-full ${containerClassName}`}>
        <div className="flex items-start gap-2">
          <label htmlFor={inputId} className="inline-flex items-center cursor-pointer">
            <input
              id={inputId}
              ref={ref}
              type="checkbox"
              role="switch"
              className={`sr-only peer ${className}`}
              aria-invalid={isInvalid || undefined}
              aria-describedby={hint || error ? `${inputId}-desc` : undefined}
              aria-required={required || undefined}
              required={required}
              {...props}
            />
            <span
              className={`relative inline-flex ${track[size]} items-center rounded-full transition-colors bg-majestic-gray-300 peer-checked:bg-majestic-pink`}
            >
              <span
                className={`absolute left-0.5 top-1/2 -translate-y-1/2 rounded-full bg-white shadow transition-transform ${knob[size]}`}
                aria-hidden
              />
            </span>
            {label && (
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 select-none">
                {label}
                {required ? <span className="ml-1 text-red-600" aria-hidden>*</span> : null}
              </span>
            )}
          </label>
        </div>
        {error ? (
          <p id={`${inputId}-desc`} className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : hint ? (
          <p id={`${inputId}-desc`} className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Switch.displayName = 'Switch';
