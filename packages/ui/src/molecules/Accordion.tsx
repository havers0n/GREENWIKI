import React, { useState, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Card } from '../atoms/Card';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';
import { cn } from '../lib/utils';

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  defaultExpanded?: string[];
  multiple?: boolean;
  className?: string;
  itemClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultExpanded = [],
  multiple = false,
  className,
  itemClassName,
  headerClassName,
  contentClassName,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(defaultExpanded)
  );

  const toggleItem = useCallback((itemId: string, disabled?: boolean) => {
    if (disabled) return;

    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        if (!multiple) {
          newSet.clear();
        }
        newSet.add(itemId);
      }
      return newSet;
    });
  }, [multiple]);

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item) => {
        const isExpanded = expandedItems.has(item.id);

        return (
          <Card
            key={item.id}
            className={cn(
              'transition-all duration-200',
              item.disabled && 'opacity-50 cursor-not-allowed',
              itemClassName
            )}
          >
            <button
              type="button"
              onClick={() => toggleItem(item.id, item.disabled)}
              disabled={item.disabled}
              className={cn(
                'w-full flex items-center justify-between p-4 text-left',
                'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
                'disabled:cursor-not-allowed',
                headerClassName
              )}
            >
              <Typography variant="body" className="font-medium">
                {item.title}
              </Typography>
              <Icon 
                icon={isExpanded ? ChevronUp : ChevronDown}
                className="w-5 h-5 text-gray-500 transition-transform duration-200" 
              />
            </button>

            {isExpanded && (
              <div
                className={cn(
                  'px-4 pb-4 border-t border-gray-200 dark:border-gray-700',
                  contentClassName
                )}
              >
                <div className="pt-4">
                  <Typography variant="body" className="text-gray-700 dark:text-gray-300">
                    {item.content}
                  </Typography>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

// Types are already exported above
