
import React from 'react';

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'link';
type TypographyComponent = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'a';

interface TypographyProps {
  children: React.ReactNode;
  as?: TypographyComponent;
  variant?: TypographyVariant;
  className?: string;
  href?: string;
}

const variantMapping: Record<TypographyVariant, string> = {
  h1: 'text-4xl font-bold tracking-tight',
  h2: 'text-2xl font-bold tracking-tight',
  h3: 'text-xl font-semibold',
  h4: 'text-lg font-medium',
  body: 'text-base text-majestic-gray-400',
  small: 'text-sm text-majestic-gray-400',
  link: 'text-majestic-pink hover:underline',
};

export const Typography: React.FC<TypographyProps> = ({
  as: Component = 'p',
  variant = 'body',
  className = '',
  children,
  ...props
}) => {
  const classes = `${variantMapping[variant]} ${className}`;
  return <Component className={classes} {...props}>{children}</Component>;
};
