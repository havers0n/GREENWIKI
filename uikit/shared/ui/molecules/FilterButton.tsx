import React from 'react';
import { Icon } from '../atoms/Icon';

interface FilterButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconName: string;
  children: React.ReactNode;
}

export const FilterButton: React.FC<FilterButtonProps> = ({ iconName, children, className = '', ...props }) => {
  return (
    <button 
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-majestic-gray-200 bg-white text-sm font-medium text-majestic-dark hover:bg-majestic-gray-100 transition-colors ${className}`}
      {...props}
    >
      <Icon name={iconName} className="w-4 h-4 text-majestic-gray-400" />
      <span>{children}</span>
    </button>
  );
};