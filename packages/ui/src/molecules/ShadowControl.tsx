import React, { forwardRef } from 'react';
import { cn } from '../lib/utils';
import { ActionIcon } from '../atoms/ActionIcon';
import { Box } from 'lucide-react';

export type ShadowValue = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface ShadowControlProps {
  value?: ShadowValue;
  onChange: (value: ShadowValue) => void;
  className?: string;
  disabled?: boolean;
}

const SHADOW_OPTIONS: Array<{
  value: ShadowValue;
  label: string;
  preview: string;
}> = [
  { value: 'none', label: 'Без тени', preview: 'none' },
  { value: 'sm', label: 'Маленькая', preview: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
  { value: 'md', label: 'Средняя', preview: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' },
  { value: 'lg', label: 'Большая', preview: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' },
  { value: 'xl', label: 'Очень большая', preview: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' },
];

export const ShadowControl = React.memo(
  forwardRef<HTMLDivElement, ShadowControlProps>(({
    value = 'none',
    onChange,
    className,
    disabled = false,
  }, ref) => {
    const handleShadowSelect = (newValue: ShadowValue) => {
      if (!disabled && newValue !== value) {
        onChange(newValue);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'space-y-3 p-4',
          'bg-gray-50 dark:bg-gray-800/50',
          'border border-gray-200 dark:border-gray-700',
          'rounded-lg',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {React.createElement(Box as any, { className: "w-4 h-4" })}
          Тень
        </div>

        {/* Варианты теней */}
        <div className="grid grid-cols-5 gap-2">
          {SHADOW_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleShadowSelect(option.value)}
              disabled={disabled}
              className={cn(
                'relative p-3 rounded-lg border-2 transition-all duration-200',
                'flex flex-col items-center gap-2',
                'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                value === option.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400'
              )}
              aria-label={`Выбрать тень: ${option.label}`}
              aria-pressed={value === option.value}
            >
              {/* Визуальный превью */}
              <div
                className="w-8 h-8 bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500 flex items-center justify-center"
                style={{ boxShadow: option.preview }}
              >
                <div className="w-3 h-3 bg-gray-400 rounded-sm"></div>
              </div>

              {/* Метка */}
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {option.label}
              </span>

              {/* Индикатор выбора */}
              {value === option.value && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Текущая тень */}
        <div className="flex items-center justify-center pt-2">
          <div
            className="px-3 py-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            style={{ boxShadow: SHADOW_OPTIONS.find(opt => opt.value === value)?.preview }}
          >
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Предпросмотр: {SHADOW_OPTIONS.find(opt => opt.value === value)?.label}
            </span>
          </div>
        </div>

        {/* CSS значение */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          CSS: <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">
            {SHADOW_OPTIONS.find(opt => opt.value === value)?.preview}
          </code>
        </div>
      </div>
    );
  })
);

ShadowControl.displayName = 'ShadowControl';
