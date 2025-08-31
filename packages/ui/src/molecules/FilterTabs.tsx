import React from 'react';
import { Button } from '../atoms/Button';
import { cn } from '../lib/utils';

export interface FilterTabsProps {
  options: string[];
  active: string;
  onSelect: (option: string) => void;
  className?: string;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  options,
  active,
  onSelect,
  className
}) => {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => (
        <Button
          key={option}
          variant={active === option ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onSelect(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  );
};
