import React from 'react';

export const BadgeTone = {
  Neutral: 'neutral',
  Primary: 'primary',
  Red: 'red',
  Green: 'green',
  Blue: 'blue',
} as const;
export type BadgeTone = typeof BadgeTone[keyof typeof BadgeTone];

export const BadgeVariant = {
  Solid: 'solid',
  Soft: 'soft',
  Outline: 'outline',
} as const;
export type BadgeVariant = typeof BadgeVariant[keyof typeof BadgeVariant];

export const BadgeSize = {
  Xs: 'xs',
  Sm: 'sm',
  Md: 'md',
} as const;
export type BadgeSize = typeof BadgeSize[keyof typeof BadgeSize];

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const getColorClasses = (tone: BadgeTone, variant: BadgeVariant): string => {
  const map: Record<BadgeTone, Record<BadgeVariant, string>> = {
    [BadgeTone.Neutral]: {
      [BadgeVariant.Solid]: 'bg-majestic-gray-300 text-majestic-dark',
      [BadgeVariant.Soft]: 'bg-majestic-gray-100 text-majestic-dark',
      [BadgeVariant.Outline]: 'border-majestic-gray-300 text-majestic-dark border',
    },
    [BadgeTone.Primary]: {
      [BadgeVariant.Solid]: 'bg-majestic-pink text-white',
      [BadgeVariant.Soft]: 'bg-majestic-pink/10 text-majestic-pink',
      [BadgeVariant.Outline]: 'border-majestic-pink text-majestic-pink border',
    },
    [BadgeTone.Red]: {
      [BadgeVariant.Solid]: 'bg-status-red text-white',
      [BadgeVariant.Soft]: 'bg-status-red/10 text-status-red',
      [BadgeVariant.Outline]: 'border-status-red text-status-red border',
    },
    [BadgeTone.Green]: {
      [BadgeVariant.Solid]: 'bg-status-green text-white',
      [BadgeVariant.Soft]: 'bg-status-green/10 text-status-green',
      [BadgeVariant.Outline]: 'border-status-green text-status-green border',
    },
    [BadgeTone.Blue]: {
      [BadgeVariant.Solid]: 'bg-status-blue text-white',
      [BadgeVariant.Soft]: 'bg-status-blue/10 text-status-blue',
      [BadgeVariant.Outline]: 'border-status-blue text-status-blue border',
    },
  };
  return map[tone]?.[variant] ?? map[BadgeTone.Neutral][BadgeVariant.Solid];
};

const sizeToClasses: Record<BadgeSize, string> = {
  [BadgeSize.Xs]: 'text-[10px] px-1.5 py-0.5',
  [BadgeSize.Sm]: 'text-xs px-2 py-0.5',
  [BadgeSize.Md]: 'text-sm px-2.5 py-1',
};

export const Badge: React.FC<BadgeProps> = ({
  tone = BadgeTone.Neutral,
  variant = BadgeVariant.Solid,
  size = BadgeSize.Sm,
  className = '',
  children,
  ...props
}) => {
  const base = 'inline-flex items-center rounded-full font-medium border-transparent';
  const color = getColorClasses(tone, variant);
  const sizing = sizeToClasses[size];

  return (
    <span className={`${base} ${color} ${sizing} ${className}`} {...props}>
      {children}
    </span>
  );
};
