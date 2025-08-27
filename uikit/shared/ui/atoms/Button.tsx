
import React from 'react';

export enum ButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Ghost = 'ghost',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = ButtonVariant.Primary, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantStyles = {
    [ButtonVariant.Primary]: "bg-majestic-pink text-white hover:bg-opacity-90 focus:ring-majestic-pink",
    [ButtonVariant.Secondary]: "bg-majestic-gray-200 text-majestic-dark hover:bg-majestic-gray-300 focus:ring-majestic-gray-400",
    [ButtonVariant.Ghost]: "bg-transparent text-majestic-dark hover:bg-majestic-gray-200 focus:ring-majestic-gray-400",
  };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
