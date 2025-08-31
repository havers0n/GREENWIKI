
import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Design tokens types
export type CardShadow = 'none' | 'sm' | 'md' | 'lg';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  shadow?: CardShadow;
  padding?: CardPadding;
  withBorder?: boolean;
  className?: string;
}

// Utility function for merging classes
const cn = (...classes: (string | undefined | null | false)[]) => {
  return twMerge(clsx(...classes));
};

// Card styles using design tokens
const cardVariants = {
  base: cn(
    'bg-[var(--color-bg-card)]',
    'rounded-xl',
    'transition-all duration-200 ease-in-out',
    'hover:shadow-[var(--shadow-card-hover)]'
  ),
  shadows: {
    none: 'shadow-none',
    sm: 'shadow-[var(--shadow-card-sm)]',
    md: 'shadow-[var(--shadow-card-md)]',
    lg: 'shadow-[var(--shadow-card-lg)]',
  },
  paddings: {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  },
  border: 'border border-[var(--color-border-card)]',
};

export const Card = React.memo(
  forwardRef<HTMLDivElement, CardProps>(
    (
      {
        children,
        shadow = 'sm',
        padding = 'md',
        withBorder = true,
        className = '',
        ...props
      },
      ref,
    ) => {
      return (
        <div
          ref={ref}
          className={cn(
            cardVariants.base,
            cardVariants.shadows[shadow],
            cardVariants.paddings[padding],
            withBorder && cardVariants.border,
            className
          )}
          {...props}
        >
          {children}
        </div>
      );
    },
  )
);

Card.displayName = 'Card';
