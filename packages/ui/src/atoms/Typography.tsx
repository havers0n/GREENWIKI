
import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Design tokens types
export const TypographyVariant = {
  H1: 'h1',
  H2: 'h2',
  H3: 'h3',
  H4: 'h4',
  Body: 'body',
  Small: 'small',
  Link: 'link',
} as const;
export type TypographyVariant = typeof TypographyVariant[keyof typeof TypographyVariant];

export const TypographyComponent = {
  H1: 'h1',
  H2: 'h2',
  H3: 'h3',
  H4: 'h4',
  H5: 'h5',
  H6: 'h6',
  P: 'p',
  Span: 'span',
  Div: 'div',
  A: 'a',
} as const;
export type TypographyComponent = typeof TypographyComponent[keyof typeof TypographyComponent];

export interface TypographyProps {
  children: React.ReactNode;
  as?: TypographyComponent;
  variant?: TypographyVariant;
  className?: string;
  href?: string;
}

// Utility function for merging classes
const cn = (...classes: (string | undefined | null | false)[]) => {
  return twMerge(clsx(...classes));
};

// Typography styles using design tokens
const typographyVariants = {
  base: 'font-medium leading-normal',
  variants: {
    variant: {
      [TypographyVariant.H1]: cn(
        'text-4xl font-bold tracking-tight',
        'text-[var(--color-text-primary)]'
      ),
      [TypographyVariant.H2]: cn(
        'text-2xl font-bold tracking-tight',
        'text-[var(--color-text-primary)]'
      ),
      [TypographyVariant.H3]: cn(
        'text-xl font-semibold',
        'text-[var(--color-text-primary)]'
      ),
      [TypographyVariant.H4]: cn(
        'text-lg font-medium',
        'text-[var(--color-text-primary)]'
      ),
      [TypographyVariant.Body]: cn(
        'text-base',
        'text-[var(--color-text-primary)]'
      ),
      [TypographyVariant.Small]: cn(
        'text-sm',
        'text-[var(--color-text-secondary)]'
      ),
      [TypographyVariant.Link]: cn(
        'text-[var(--color-majestic-pink)] hover:underline',
        'transition-colors duration-200'
      ),
    },
  },
};

export const Typography = React.memo<TypographyProps>(({
  as: Component = TypographyComponent.P,
  variant = TypographyVariant.Body,
  className = '',
  children,
  ...props
}) => {
  return (
    <Component
      className={cn(
        typographyVariants.base,
        typographyVariants.variants.variant[variant],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

Typography.displayName = 'Typography';
