import React, { forwardRef } from 'react';
import { cn } from '../lib/utils';
import { ActionIcon, ActionIconVariant } from '../atoms/ActionIcon';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react';

export type AlignmentValue = 'left' | 'center' | 'right' | 'justify';

export interface AlignmentControlProps {
  value?: AlignmentValue;
  onChange: (value: AlignmentValue) => void;
  className?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

const alignmentOptions = [
  {
    value: 'left' as AlignmentValue,
    icon: AlignLeft,
    label: 'Выровнять по левому краю',
  },
  {
    value: 'center' as AlignmentValue,
    icon: AlignCenter,
    label: 'Выровнять по центру',
  },
  {
    value: 'right' as AlignmentValue,
    icon: AlignRight,
    label: 'Выровнять по правому краю',
  },
  {
    value: 'justify' as AlignmentValue,
    icon: AlignJustify,
    label: 'Выровнять по ширине',
  },
];

export const AlignmentControl = React.memo(
  forwardRef<HTMLDivElement, AlignmentControlProps>(({
    value = 'left',
    onChange,
    className,
    size = 'sm',
    disabled = false,
  }, ref) => {
    const handleAlignmentChange = (newValue: AlignmentValue) => {
      if (!disabled && newValue !== value) {
        onChange(newValue);
      }
    };

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label="Выбор выравнивания"
        className={cn(
          'inline-flex items-center gap-1 p-1',
          'bg-gray-50 dark:bg-gray-800/50',
          'border border-gray-200 dark:border-gray-700',
          'rounded-lg',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {alignmentOptions.map((option) => {
          const Icon = option.icon;
          const isActive = option.value === value;

          return (
            <ActionIcon
              key={option.value}
              variant={isActive ? 'filled' : 'subtle'}
              size={size}
              color={isActive ? 'primary' : 'secondary'}
              aria-label={option.label}
              role="radio"
              aria-checked={isActive}
              disabled={disabled}
              onClick={() => handleAlignmentChange(option.value)}
              className={cn(
                'transition-all duration-150',
                isActive && 'shadow-sm',
                !isActive && !disabled && 'hover:scale-105'
              )}
            >
              <Icon size={size === 'sm' ? 16 : 20} />
            </ActionIcon>
          );
        })}
      </div>
    );
  })
);

AlignmentControl.displayName = 'AlignmentControl';
