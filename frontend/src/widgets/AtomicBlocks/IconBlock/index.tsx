import React from 'react';

interface IconBlockProps {
  icon: string;
  size?: 'small' | 'medium' | 'large' | 'xl';
  color?: string;
  metadata?: Record<string, unknown>;
}

const IconBlock: React.FC<IconBlockProps> = ({
  icon,
  size = 'medium',
  color = 'currentColor',
  metadata = {}
}) => {
  const sizeClass = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
    xl: 'w-12 h-12'
  }[size];

  const iconStyle: React.CSSProperties = {
    color: color,
    ...metadata
  };

  // Если icon это emoji, отображаем его напрямую
  if (icon.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u)) {
    return (
      <span
        className={`${sizeClass} inline-flex items-center justify-center`}
        style={iconStyle}
      >
        {icon}
      </span>
    );
  }

  // Для SVG иконок или других символов
  return (
    <span
      className={`${sizeClass} inline-flex items-center justify-center`}
      style={iconStyle}
    >
      {icon}
    </span>
  );
};

export default IconBlock;
