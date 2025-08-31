import React, { useState, useRef, useEffect, useId } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Design tokens types
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: TooltipPosition;
  disabled?: boolean;
  delay?: number;
  className?: string;
}

// Utility function for merging classes
const cn = (...classes: (string | undefined | null | false)[]) => {
  return twMerge(clsx(...classes));
};

// Tooltip styles using design tokens
const tooltipVariants = {
  base: cn(
    'fixed z-50',
    'px-3 py-2',
    'text-sm text-[var(--color-text-on-tooltip)]',
    'bg-[var(--color-bg-tooltip)]',
    'border border-[var(--color-border-tooltip)]',
    'rounded-lg',
    'shadow-[var(--shadow-tooltip)]',
    'pointer-events-none',
    'transition-all duration-200 ease-out',
    'max-w-xs text-center',
    'opacity-0 scale-95'
  ),
  visible: cn(
    'opacity-100 scale-100'
  ),
  arrow: cn(
    'absolute w-2 h-2',
    'bg-[var(--color-bg-tooltip)]',
    'border border-[var(--color-border-tooltip)]',
    'transform rotate-45'
  ),
  positions: {
    top: '-bottom-1 left-1/2 -translate-x-1/2',
    bottom: '-top-1 left-1/2 -translate-x-1/2',
    left: '-right-1 top-1/2 -translate-y-1/2',
    right: '-left-1 top-1/2 -translate-y-1/2',
  },
};

// Custom hook for tooltip positioning with boundary detection
const useTooltipPosition = (
  isVisible: boolean,
  position: TooltipPosition,
  coords: { x: number; y: number },
  tooltipRef: React.RefObject<HTMLDivElement>
) => {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isVisible || !tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const offset = 8;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = coords.y - tooltipRect.height - offset;
        left = coords.x - tooltipRect.width / 2;
        break;
      case 'bottom':
        top = coords.y + offset;
        left = coords.x - tooltipRect.width / 2;
        break;
      case 'left':
        top = coords.y - tooltipRect.height / 2;
        left = coords.x - tooltipRect.width - offset;
        break;
      case 'right':
        top = coords.y - tooltipRect.height / 2;
        left = coords.x + offset;
        break;
    }

    // Boundary detection and adjustment
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust horizontal position
    if (left < 0) {
      left = offset;
    } else if (left + tooltipRect.width > viewportWidth) {
      left = viewportWidth - tooltipRect.width - offset;
    }

    // Adjust vertical position
    if (top < 0) {
      top = offset;
    } else if (top + tooltipRect.height > viewportHeight) {
      top = viewportHeight - tooltipRect.height - offset;
    }

    setTooltipPosition({ top, left });
  }, [isVisible, position, coords, tooltipRef]);

  return tooltipPosition;
};

export const Tooltip = React.memo<TooltipProps>(
  ({
    children,
    content,
    position = 'top',
    disabled = false,
    delay = 300,
    className = '',
  }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipId = useId();

    const tooltipPosition = useTooltipPosition(isVisible, position, coords, tooltipRef);

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const showTooltip = (event: React.MouseEvent) => {
      if (disabled) return;

      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });

      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    };

    const showTooltipOnFocus = (event: React.FocusEvent) => {
      if (disabled) return;

      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });

      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    };

    const hideTooltip = () => {
      if (disabled) return;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsVisible(false);
    };

    // Don't render tooltip if disabled or no content
    if (disabled || !content) {
      return <>{children}</>;
    }

    return (
      <>
        <div
          ref={triggerRef}
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
          onFocus={showTooltipOnFocus}
          onBlur={hideTooltip}
          className="inline-block"
          aria-describedby={isVisible ? tooltipId : undefined}
          tabIndex={0}
        >
          {children}
        </div>

        {isVisible && (
          <div
            id={tooltipId}
            ref={tooltipRef}
            role="tooltip"
            className={cn(
              tooltipVariants.base,
              tooltipVariants.visible,
              className
            )}
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
            }}
          >
            {content}

            {/* Arrow */}
            <div
              className={cn(
                tooltipVariants.arrow,
                tooltipVariants.positions[position]
              )}
            />
          </div>
        )}
      </>
    );
  }
);

Tooltip.displayName = 'Tooltip';
