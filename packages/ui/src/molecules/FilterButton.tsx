import React from 'react';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { cn } from '../lib/utils';
import { LucideIcon } from 'lucide-react';

export interface FilterButtonProps {
  icon?: LucideIcon | string; // Поддерживаем как компонент, так и строку для обратной совместимости
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  icon,
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
      {icon && <Icon 
        name={typeof icon === 'string' ? icon : undefined}
        icon={typeof icon === 'function' ? icon : undefined}
        className="w-4 h-4" 
      />}
      {children}
    </Button>
  );
};
