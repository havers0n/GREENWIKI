
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl border border-majestic-gray-200 shadow-sm transition-shadow hover:shadow-md ${className}`}>
      {children}
    </div>
  );
};
