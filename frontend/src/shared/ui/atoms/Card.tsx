
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-majestic-gray-200 dark:border-gray-700 shadow-sm transition-shadow hover:shadow-md ${className}`}>
      {children}
    </div>
  );
};
