
import React from 'react';

export const ButtonVariant = {
  Primary: 'primary',
  Secondary: 'secondary',
  Danger: 'danger',
  Ghost: 'ghost',
} as const;
export type ButtonVariant = typeof ButtonVariant[keyof typeof ButtonVariant];

export const ButtonSize = {
  Sm: 'sm',
  Md: 'md',
  Lg: 'lg',
} as const;
export type ButtonSize = typeof ButtonSize[keyof typeof ButtonSize];

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = ButtonVariant.Primary,
  size = ButtonSize.Md,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

  const sizeStyles: Record<ButtonSize, string> = {
    [ButtonSize.Sm]: 'text-sm px-3 py-1.5',
    [ButtonSize.Md]: 'text-sm px-4 py-2',
    [ButtonSize.Lg]: 'text-base px-5 py-2.5',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    [ButtonVariant.Primary]: 'bg-majestic-pink text-white hover:bg-majestic-pink/90 focus-visible:ring-majestic-pink',
    [ButtonVariant.Secondary]: 'bg-majestic-gray-200 text-majestic-dark hover:bg-majestic-gray-300 focus-visible:ring-majestic-gray-400',
    [ButtonVariant.Danger]: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
    [ButtonVariant.Ghost]: 'bg-transparent text-majestic-dark hover:bg-majestic-gray-200 focus-visible:ring-majestic-gray-400',
  };

  return (
    <button className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
