import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { ChevronDown, ChevronRight, LucideIcon } from 'lucide-react';
import { Icon } from '../atoms/Icon';

export interface InspectorSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  collapsible?: boolean;
  icon?: LucideIcon | string; // Поддерживаем как компонент, так и строку для обратной совместимости
  className?: string;
}

export const InspectorSection = React.memo<InspectorSectionProps>(({
  title,
  children,
  defaultExpanded = true,
  collapsible = true,
  icon,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  const handleToggle = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

  return (
    <div
      className={cn(
        'border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden',
        'bg-white dark:bg-gray-800',
        className
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={!collapsible}
        className={cn(
          'w-full px-4 py-3 text-left flex items-center gap-2',
          'hover:bg-gray-50 dark:hover:bg-gray-700/50',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
          {
            'cursor-pointer': collapsible,
            'cursor-default': !collapsible,
          }
        )}
      >
        {collapsible && (
          <Icon
            icon={isExpanded ? ChevronDown : ChevronRight}
            className={cn(
              'text-gray-500 dark:text-gray-400',
              'transition-transform duration-200',
              {
                'rotate-0': !isExpanded,
                'rotate-180': isExpanded,
              }
            )}
            size={16}
          />
        )}

        {icon && (
          <Icon
            name={typeof icon === 'string' ? icon : undefined}
            icon={typeof icon === 'function' ? icon : undefined}
            size={16}
            className="flex-shrink-0 text-gray-600 dark:text-gray-300"
          />
        )}

        <span className="font-medium text-gray-900 dark:text-gray-100 text-sm flex-1">
          {title}
        </span>
      </button>

      {/* Content */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          {
            'max-h-0 opacity-0': !isExpanded,
            'max-h-screen opacity-100': isExpanded,
          }
        )}
      >
        <div className="px-4 pb-4 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
});

InspectorSection.displayName = 'InspectorSection';
