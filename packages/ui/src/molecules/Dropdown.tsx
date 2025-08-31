import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Icon } from '../atoms/Icon';
import { cn } from '../lib/utils';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ElementType;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  onChange: (value: string | string[]) => void;
  renderOption?: (option: DropdownOption) => React.ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  placeholder = 'Выберите...',
  searchable = false,
  multiple = false,
  disabled = false,
  className,
  onChange,
  renderOption
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>(
    multiple && Array.isArray(value) ? value : []
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (multiple && Array.isArray(value)) {
      setSelectedValues(value);
    }
  }, [value, multiple]);

  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : [...selectedValues, optionValue];
      setSelectedValues(newValues);
      onChange(newValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
    setSearchTerm('');
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen && searchable) {
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
    }
  };

  const getDisplayValue = () => {
    if (multiple) {
      if (selectedValues.length === 0) return placeholder;
      if (selectedValues.length === 1) {
        return options.find(opt => opt.value === selectedValues[0])?.label || placeholder;
      }
      return `${selectedValues.length} выбрано`;
    }

    return options.find(opt => opt.value === value)?.label || placeholder;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          'relative w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600',
          'rounded-lg px-3 py-2 text-left shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          isOpen && 'ring-2 ring-blue-500 border-blue-500',
          className
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="block truncate">{getDisplayValue()}</span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <Icon
            icon={ChevronDown}
            className={cn(
              'h-5 w-5 text-gray-400 transition-transform',
              isOpen && 'transform rotate-180'
            )}
          />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
          {searchable && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          <ul className="py-1" role="listbox">
            {filteredOptions.map((option) => (
              <li
                key={option.value}
                onClick={() => !option.disabled && handleSelect(option.value)}
                className={cn(
                  'flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700',
                  option.disabled && 'opacity-50 cursor-not-allowed',
                  !multiple && value === option.value && 'bg-blue-50 dark:bg-blue-900/20',
                  multiple && selectedValues.includes(option.value) && 'bg-blue-50 dark:bg-blue-900/20'
                )}
                role="option"
                aria-selected={
                  multiple
                    ? selectedValues.includes(option.value)
                    : value === option.value
                }
              >
                {multiple && (
                  <div className="mr-3">
                    {selectedValues.includes(option.value) && (
                      <Icon icon={Check} size={16} className="text-blue-600" />
                    )}
                  </div>
                )}

                {option.icon && (
                  <Icon icon={option.icon} size={16} className="mr-3" />
                )}

                <span className="flex-1">{renderOption ? renderOption(option) : option.label}</span>
              </li>
            ))}

            {filteredOptions.length === 0 && (
              <li className="px-3 py-2 text-gray-500 dark:text-gray-400 text-center">
                Ничего не найдено
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
