import React, { useState, useCallback, forwardRef } from 'react';
import { cn } from '../lib/utils';
import { Input } from '../atoms/Input';
import { ActionIcon } from '../atoms/ActionIcon';
import { Link, Unlink } from 'lucide-react';
import { Icon } from '../atoms/Icon';

export interface SpacingValue {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

export interface SpacingControlProps {
  value?: SpacingValue;
  onChange: (value: SpacingValue) => void;
  allowLinked?: boolean;
  className?: string;
  disabled?: boolean;
}

const SPACING_LABELS = {
  top: 'Верхний отступ',
  right: 'Правый отступ',
  bottom: 'Нижний отступ',
  left: 'Левый отступ',
} as const;

export const SpacingControl = React.memo(
  forwardRef<HTMLDivElement, SpacingControlProps>(({
    value = {},
    onChange,
    allowLinked = true,
    className,
    disabled = false,
  }, ref) => {
    const [isLinked, setIsLinked] = useState(true);

    // Check if all values are the same (for initial linked state)
    const allValuesEqual = useCallback(() => {
      const { top, right, bottom, left } = value;
      const values = [top, right, bottom, left].filter(v => v !== undefined && v !== '');
      return values.length > 1 && values.every(v => v === values[0]);
    }, [value]);

    // Update isLinked state when values change
    React.useEffect(() => {
      if (allowLinked && allValuesEqual()) {
        setIsLinked(true);
      }
    }, [value, allowLinked, allValuesEqual]);

    const handleValueChange = useCallback((side: keyof SpacingValue, newValue: string) => {
      if (disabled) return;

      let updatedValue: SpacingValue;

      if (isLinked && allowLinked) {
        // Update all sides with the same value
        updatedValue = {
          top: newValue || undefined,
          right: newValue || undefined,
          bottom: newValue || undefined,
          left: newValue || undefined,
        };
      } else {
        // Update only the specific side
        updatedValue = {
          ...value,
          [side]: newValue || undefined,
        };
      }

      onChange(updatedValue);
    }, [value, isLinked, allowLinked, disabled, onChange]);

    const toggleLinked = useCallback(() => {
      if (!allowLinked || disabled) return;
      setIsLinked(!isLinked);
    }, [isLinked, allowLinked, disabled]);

    const getInputValue = (side: keyof SpacingValue) => {
      return value[side] || '';
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center gap-4 p-4',
          'bg-gray-50 dark:bg-gray-800/50',
          'border border-gray-200 dark:border-gray-700',
          'rounded-lg',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {/* Visual representation */}
        <div className="relative">
          {/* Element representation */}
          <div className="w-16 h-12 bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 rounded flex items-center justify-center">
            <div className="w-8 h-6 bg-blue-500 rounded-sm"></div>
          </div>

          {/* Spacing inputs positioned around the element */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <Input
              size="sm"
              value={getInputValue('top')}
              onChange={(e) => handleValueChange('top', e.target.value)}
              placeholder="0"
              disabled={disabled}
              className="w-12 text-center"
              aria-label={SPACING_LABELS.top}
            />
          </div>

          <div className="absolute top-1/2 -right-8 transform -translate-y-1/2">
            <Input
              size="sm"
              value={getInputValue('right')}
              onChange={(e) => handleValueChange('right', e.target.value)}
              placeholder="0"
              disabled={disabled}
              className="w-12 text-center"
              aria-label={SPACING_LABELS.right}
            />
          </div>

          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
            <Input
              size="sm"
              value={getInputValue('bottom')}
              onChange={(e) => handleValueChange('bottom', e.target.value)}
              placeholder="0"
              disabled={disabled}
              className="w-12 text-center"
              aria-label={SPACING_LABELS.bottom}
            />
          </div>

          <div className="absolute top-1/2 -left-8 transform -translate-y-1/2">
            <Input
              size="sm"
              value={getInputValue('left')}
              onChange={(e) => handleValueChange('left', e.target.value)}
              placeholder="0"
              disabled={disabled}
              className="w-12 text-center"
              aria-label={SPACING_LABELS.left}
            />
          </div>
        </div>

        {/* Linked toggle button */}
        {allowLinked && (
          <ActionIcon
            variant="subtle"
            size="sm"
            color={isLinked ? 'primary' : 'secondary'}
            onClick={toggleLinked}
            disabled={disabled}
            aria-label={isLinked ? 'Разорвать связь между значениями' : 'Связать все значения'}
            className={cn(
              'transition-colors duration-200',
              isLinked && 'text-blue-600 dark:text-blue-400'
            )}
          >
            {isLinked ? <Icon icon={Link} size={16} /> : <Icon icon={Unlink} size={16} />}
          </ActionIcon>
        )}

        {/* Linked status indicator */}
        {allowLinked && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {isLinked ? 'Значения связаны' : 'Значения независимы'}
          </div>
        )}
      </div>
    );
  })
);

SpacingControl.displayName = 'SpacingControl';
