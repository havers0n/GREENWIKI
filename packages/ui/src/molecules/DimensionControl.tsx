import React, { forwardRef } from 'react';
import { cn } from '../lib/utils';
import { Input } from '../atoms/Input';
import { InspectorField } from './InspectorField';
import { Move, MoveHorizontal, MoveVertical } from 'lucide-react';

export interface DimensionValue {
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;
}

export interface DimensionControlProps {
  value?: DimensionValue;
  onChange: (value: DimensionValue) => void;
  showConstraints?: boolean;
  className?: string;
  disabled?: boolean;
}

const DIMENSION_LABELS = {
  width: 'Ширина',
  height: 'Высота',
  minWidth: 'Минимальная ширина',
  maxWidth: 'Максимальная ширина',
  minHeight: 'Минимальная высота',
  maxHeight: 'Максимальная высота',
} as const;

export const DimensionControl = React.memo(
  forwardRef<HTMLDivElement, DimensionControlProps>(({
    value = {},
    onChange,
    showConstraints = false,
    className,
    disabled = false,
  }, ref) => {
    const handleValueChange = (key: keyof DimensionValue, newValue: string) => {
      if (disabled) return;

      const updatedValue = {
        ...value,
        [key]: newValue || undefined,
      };

      onChange(updatedValue);
    };

    const getValue = (key: keyof DimensionValue) => {
      return value[key] || '';
    };

    return (
      <div
        ref={ref}
        className={cn(
          'space-y-4 p-4',
          'bg-gray-50 dark:bg-gray-800/50',
          'border border-gray-200 dark:border-gray-700',
          'rounded-lg',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {/* Основные размеры */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Move className="w-4 h-4" />
            Основные размеры
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InspectorField label="Ширина">
              <div className="relative">
                <Input
                  value={getValue('width')}
                  onChange={(e) => handleValueChange('width', e.target.value)}
                  placeholder="auto"
                  disabled={disabled}
                  aria-label={DIMENSION_LABELS.width}
                  className="pr-8"
                />
                <MoveHorizontal className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </InspectorField>

            <InspectorField label="Высота">
              <div className="relative">
                <Input
                  value={getValue('height')}
                  onChange={(e) => handleValueChange('height', e.target.value)}
                  placeholder="auto"
                  disabled={disabled}
                  aria-label={DIMENSION_LABELS.height}
                  className="pr-8"
                />
                <MoveVertical className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </InspectorField>
          </div>
        </div>

        {/* Ограничения размеров */}
        {showConstraints && (
          <div className="space-y-3 border-t border-gray-200 dark:border-gray-600 pt-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Move className="w-4 h-4" />
              Ограничения
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InspectorField label="Мин. ширина">
                <Input
                  value={getValue('minWidth')}
                  onChange={(e) => handleValueChange('minWidth', e.target.value)}
                  placeholder="0"
                  disabled={disabled}
                  aria-label={DIMENSION_LABELS.minWidth}
                />
              </InspectorField>

              <InspectorField label="Макс. ширина">
                <Input
                  value={getValue('maxWidth')}
                  onChange={(e) => handleValueChange('maxWidth', e.target.value)}
                  placeholder="none"
                  disabled={disabled}
                  aria-label={DIMENSION_LABELS.maxWidth}
                />
              </InspectorField>

              <InspectorField label="Мин. высота">
                <Input
                  value={getValue('minHeight')}
                  onChange={(e) => handleValueChange('minHeight', e.target.value)}
                  placeholder="0"
                  disabled={disabled}
                  aria-label={DIMENSION_LABELS.minHeight}
                />
              </InspectorField>

              <InspectorField label="Макс. высота">
                <Input
                  value={getValue('maxHeight')}
                  onChange={(e) => handleValueChange('maxHeight', e.target.value)}
                  placeholder="none"
                  disabled={disabled}
                  aria-label={DIMENSION_LABELS.maxHeight}
                />
              </InspectorField>
            </div>
          </div>
        )}

        {/* Визуальный предпросмотр */}
        <div className="flex justify-center pt-2">
          <div
            className="relative bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 rounded flex items-center justify-center transition-all duration-200"
            style={{
              width: value.width ? `min(${value.width}, 120px)` : '80px',
              height: value.height ? `min(${value.height}, 60px)` : '40px',
              minWidth: value.minWidth || '40px',
              maxWidth: value.maxWidth || '120px',
              minHeight: value.minHeight || '20px',
              maxHeight: value.maxHeight || '60px',
            }}
          >
            <div className="w-4 h-3 bg-blue-500 rounded-sm"></div>

            {/* Размерные линии */}
            {value.width && (
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {value.width}
              </div>
            )}

            {value.height && (
              <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap rotate-90 origin-center">
                {value.height}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  })
);

DimensionControl.displayName = 'DimensionControl';
