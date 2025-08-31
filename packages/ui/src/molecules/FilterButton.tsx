import React from 'react';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { cn } from '../lib/utils';

export interface FilterButtonProps {
  iconName?: string;
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  iconName,
  children,
  active = false,
  onClick,
  className
}) => {
  return (
    <Button
      variant={active ? 'primary' : 'secondary'}
      size="sm"
      onClick={onClick}
      className={cn('flex items-center gap-2', className)}
    >
      {iconName && <Icon name={iconName} className="w-4 h-4" />}
      {children}
    </Button>
  );
};
