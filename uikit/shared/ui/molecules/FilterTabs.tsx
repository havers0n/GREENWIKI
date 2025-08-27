
import React from 'react';
import { Tag } from '../atoms/Tag';

interface FilterTabsProps {
  options: string[];
  active: string;
  onSelect: (option: string) => void;
  className?: string;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({ options, active, onSelect, className = '' }) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => (
        <Tag key={option} active={option === active} onClick={() => onSelect(option)}>
          {option}
        </Tag>
      ))}
    </div>
  );
};
