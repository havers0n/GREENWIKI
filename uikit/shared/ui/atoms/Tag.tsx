
import React from 'react';

interface TagProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({ children, active = false, onClick, className = '' }) => {
  const baseStyles = "px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-colors";
  const activeStyles = "bg-majestic-pink text-white";
  const inactiveStyles = "bg-majestic-gray-200 text-majestic-dark hover:bg-majestic-gray-300";

  return (
    <span
      onClick={onClick}
      className={`${baseStyles} ${active ? activeStyles : inactiveStyles} ${className}`}
    >
      {children}
    </span>
  );
};
