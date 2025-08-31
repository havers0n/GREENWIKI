import React, { useState, useCallback, forwardRef } from 'react';
import { cn } from '../lib/utils';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { InspectorField } from './InspectorField';
import { EnhancedColorPicker } from './EnhancedColorPicker';
import { ActionIcon } from '../atoms/ActionIcon';
import { Link, Unlink } from 'lucide-react';
import { Icon } from '../atoms/Icon';

export interface BorderValue {
  width?: string;
  style?: 'solid' | 'dashed' | 'dotted';
  color?: string;
  radius?: string;
}

export interface BorderControlProps {
  value?: BorderValue;
  onChange: (value: BorderValue) => void;
  showStyle?: boolean;
  showRadius?: boolean;
  className?: string;
  disabled?: boolean;
}

const BORDER_LABELS = {
  width: 'Толщина границы',
  style: 'Стиль границы',
  color: 'Цвет границы',
  radius: 'Радиус скругления',
} as const;

const BORDER_STYLES = [
  { value: 'solid', label: 'Сплошная' },
  { value: 'dashed', label: 'Пунктирная' },
  { value: 'dotted', label: 'Точечная' },
] as const;

export const BorderControl = React.memo(
  forwardRef<HTMLDivElement, BorderControlProps>(({
    value = {},
    onChange,
    showStyle = false,
    showRadius = false,
    className,
    disabled = false,
  }, ref) => {
    const [isLinked, setIsLinked] = useState(true);

    const handleValueChange = useCallback((key: keyof BorderValue, newValue: string) => {
      if (disabled) return;

      const updatedValue = {
        ...value,
        [key]: newValue || undefined,
      };

      onChange(updatedValue);
    }, [value, disabled, onChange]);

    const toggleLinked = useCallback(() => {
      if (disabled) return;
      setIsLinked(!isLinked);
    }, [isLinked, disabled]);

    const getValue = (key: keyof BorderValue) => {
      return value[key] || '';
    };

    const currentBorderStyle = getValue('style') || 'solid';
    const currentBorderColor = getValue('color') || '#000000';

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
        {/* Визуальная репрезентация */}
        <div className="flex justify-center">
          <div
            className="relative w-20 h-16 bg-white dark:bg-gray-700 rounded flex items-center justify-center transition-all duration-200"
            style={{
              borderWidth: value.width || '2px',
              borderStyle: currentBorderStyle,
              borderColor: currentBorderColor,
              borderRadius: value.radius || '4px',
            }}
          >
            <div className="w-6 h-4 bg-gray-300 dark:bg-gray-600 rounded-sm"></div>

            {/* Толщина границы */}
            {value.width && (
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-1 rounded">
                {value.width}
              </div>
            )}
          </div>
        </div>

        {/* Основные контролы */}
        <div className="space-y-3">
          {/* Толщина границы */}
          <InspectorField label="Толщина">
            <div className="flex items-center gap-2">
              <Input
                value={getValue('width')}
                onChange={(e) => handleValueChange('width', e.target.value)}
                placeholder="2px"
                disabled={disabled}
                aria-label={BORDER_LABELS.width}
                className="flex-1"
              />

              <ActionIcon
                variant="subtle"
                size="sm"
                color={isLinked ? 'primary' : 'secondary'}
                onClick={toggleLinked}
                disabled={disabled}
                aria-label={isLinked ? 'Разорвать связь границ' : 'Связать все границы'}
              >
                {isLinked ? <Icon icon={Link} size={16} /> : <Icon icon={Unlink} size={16} />}
              </ActionIcon>
            </div>
          </InspectorField>

          {/* Стиль границы */}
          {showStyle && (
            <InspectorField label="Стиль">
              <Select
                value={currentBorderStyle}
                onChange={(e) => handleValueChange('style', e.target.value)}
                disabled={disabled}
                aria-label={BORDER_LABELS.style}
              >
                {BORDER_STYLES.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
                ))}
              </Select>
            </InspectorField>
          )}

          {/* Цвет границы */}
          <InspectorField label="Цвет">
            <EnhancedColorPicker
              value={currentBorderColor}
              onChange={(color) => handleValueChange('color', color)}
              disabled={disabled}
              presets={['#000000', '#333333', '#666666', '#999999', '#ffffff', '#ff0000', '#00ff00', '#0000ff']}
            />
          </InspectorField>

          {/* Радиус скругления */}
          {showRadius && (
            <InspectorField label="Радиус">
              <Input
                value={getValue('radius')}
                onChange={(e) => handleValueChange('radius', e.target.value)}
                placeholder="4px"
                disabled={disabled}
                aria-label={BORDER_LABELS.radius}
              />
            </InspectorField>
          )}
        </div>

        {/* Статус связывания */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {isLinked ? 'Границы связаны' : 'Границы независимы'}
        </div>

        {/* Предпросмотр стилей */}
        {showStyle && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Предпросмотр стилей:
            </div>
            <div className="flex gap-2 justify-center">
              {BORDER_STYLES.map((style) => (
                <div
                  key={style.value}
                  className={cn(
                    'w-8 h-8 border-2 rounded flex items-center justify-center cursor-pointer transition-all',
                    currentBorderStyle === style.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  )}
                  style={{
                    borderStyle: style.value,
                    borderColor: currentBorderStyle === style.value ? currentBorderColor : undefined,
                  }}
                  onClick={() => !disabled && handleValueChange('style', style.value)}
                  title={style.label}
                >
                  {currentBorderStyle === style.value && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  })
);

BorderControl.displayName = 'BorderControl';
