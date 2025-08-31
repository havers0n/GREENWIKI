import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { cn } from '../lib/utils';
import { Palette, Check } from 'lucide-react';

export interface EnhancedColorPickerProps {
  value?: string;
  onChange: (value: string) => void;
  showAlpha?: boolean;
  presets?: string[];
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const EnhancedColorPicker = React.memo(
  forwardRef<HTMLDivElement, EnhancedColorPickerProps>(({
    value = '#000000',
    onChange,
    showAlpha = false,
    presets = [],
    className,
    placeholder = 'Выберите цвет',
    disabled = false,
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Update input value when prop changes
    useEffect(() => {
      setInputValue(value);
    }, [value]);

    // Close popup when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    // Handle color change from native input
    const handleColorChange = (newColor: string) => {
      setInputValue(newColor);
      onChange(newColor);
    };

    // Handle manual text input
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      // Validate hex/rgba format and call onChange
      if (newValue.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) ||
          (showAlpha && newValue.match(/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*\d*\.?\d+\s*)?\)$/))) {
        onChange(newValue);
      }
    };

    // Handle preset selection
    const handlePresetSelect = (presetColor: string) => {
      setInputValue(presetColor);
      onChange(presetColor);
      setIsOpen(false);
    };

    // Toggle popup
    const togglePopup = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        togglePopup();
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    return (
      <div ref={ref} className={cn('relative', className)}>
        <div
          ref={containerRef}
          className={cn(
            'flex items-center gap-2 p-2 border rounded-lg bg-white dark:bg-gray-800',
            'border-gray-300 dark:border-gray-600',
            'hover:border-gray-400 dark:hover:border-gray-500',
            'focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20',
            'transition-colors duration-200',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          {/* Color indicator and trigger */}
          <button
            type="button"
            onClick={togglePopup}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={cn(
              'relative w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600',
              'hover:border-gray-400 dark:hover:border-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
              'transition-colors duration-200',
              disabled && 'cursor-not-allowed'
            )}
            style={{ backgroundColor: inputValue }}
            aria-label="Выбрать цвет"
            title="Выбрать цвет"
          >
            <Palette className="w-4 h-4 text-white mix-blend-difference" />
          </button>

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleTextChange}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'flex-1 min-w-0 px-2 py-1 text-sm bg-transparent',
              'border-none outline-none',
              'text-gray-900 dark:text-gray-100',
              'placeholder-gray-500 dark:placeholder-gray-400',
              disabled && 'cursor-not-allowed'
            )}
            aria-label="Значение цвета"
          />

          {/* Hidden native color input */}
          <input
            type="color"
            value={inputValue.startsWith('#') ? inputValue : '#000000'}
            onChange={(e) => handleColorChange(e.target.value)}
            className="sr-only"
            disabled={disabled}
          />
        </div>

        {/* Popup */}
        {isOpen && !disabled && (
          <div
            className={cn(
              'absolute top-full left-0 mt-1 z-50',
              'w-64 p-4 bg-white dark:bg-gray-800',
              'border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg',
              'animate-in fade-in-0 zoom-in-95 duration-200'
            )}
          >
            {/* Native color picker */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Палитра
              </label>
              <input
                type="color"
                value={inputValue.startsWith('#') ? inputValue : '#000000'}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
            </div>

            {/* Alpha slider (if enabled) */}
            {showAlpha && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Прозрачность
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={inputValue.includes('rgba') ? parseFloat(inputValue.split(',')[3]?.replace(')', '') || '1') : 1}
                  onChange={(e) => {
                    const alpha = parseFloat(e.target.value);
                    const baseColor = inputValue.startsWith('#') ? inputValue : '#000000';
                    const rgbaColor = `rgba(${parseInt(baseColor.slice(1, 3), 16)}, ${parseInt(baseColor.slice(3, 5), 16)}, ${parseInt(baseColor.slice(5, 7), 16)}, ${alpha})`;
                    handleColorChange(rgbaColor);
                  }}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            )}

            {/* Presets */}
            {presets.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Предустановки
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {presets.map((presetColor, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handlePresetSelect(presetColor)}
                      className={cn(
                        'relative w-8 h-8 rounded border-2',
                        'hover:scale-110 transition-transform duration-150',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                        inputValue === presetColor
                          ? 'border-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                      )}
                      style={{ backgroundColor: presetColor }}
                      aria-label={`Выбрать цвет ${presetColor}`}
                      title={presetColor}
                    >
                      {inputValue === presetColor && (
                        <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  })
);

EnhancedColorPicker.displayName = 'EnhancedColorPicker';
