import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../atoms/Input';
import { Icon } from '../atoms/Icon';
import { cn } from '../lib/utils';

export interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value: controlledValue,
  onChange,
  placeholder = 'Поиск...',
  className,
  disabled = false,
  size = 'md',
}) => {
  const [internalValue, setInternalValue] = useState('');
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleClear = () => {
    if (!isControlled) {
      setInternalValue('');
    }
    onChange?.('');
  };

  return (
    <div className={cn('relative', className)}>
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
        <Icon icon={Search} className="h-4 w-4 text-gray-400" />
      </div>

      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        size={size}
        className="pl-10 pr-10"
      />

      {value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Очистить поиск"
        >
          <Icon icon={X} className="h-4 w-4 text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>
  );
};
