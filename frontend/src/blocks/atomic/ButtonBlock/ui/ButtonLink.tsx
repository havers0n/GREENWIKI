import React from 'react';
import { Button } from '../../../../shared/ui/atoms/Button';
import type { ButtonBlockProps } from '../types';

/**
 * ButtonLink - компонент для рендеринга кнопки как ссылки
 * Используется для внутренних ссылок со стилями кнопки
 */
const ButtonLink: React.FC<ButtonBlockProps> = ({
  text = 'Кнопка',
  link,
  variant = 'primary',
  size = 'md',
  metadata,
  className,
  style,
  onClick,
  ...rest
}) => {
  // Проверяем, что у нас есть ссылка
  if (!link || link === '#') {
    return null;
  }

  // Формируем классы на основе variant и size
  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

    const sizeClasses = {
      sm: 'text-sm px-3 py-1.5',
      md: 'text-sm px-4 py-2',
      lg: 'text-base px-5 py-2.5'
    };

    const variantClasses = {
      primary: 'bg-majestic-pink text-white hover:bg-majestic-pink/90 focus-visible:ring-majestic-pink',
      secondary: 'bg-majestic-gray-200 text-majestic-dark hover:bg-majestic-gray-300 focus-visible:ring-majestic-gray-400',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
      ghost: 'bg-transparent text-majestic-dark hover:bg-majestic-gray-200 focus-visible:ring-majestic-gray-400'
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;
  };

  return (
    <div className={className || 'flex justify-start'} style={style}>
      <a
        href={link}
        className={getButtonClasses()}
        style={{
          // Применяем стили из metadata
          marginTop: metadata?.spacing?.marginTop,
          marginRight: metadata?.spacing?.marginRight,
          marginBottom: metadata?.spacing?.marginBottom,
          marginLeft: metadata?.spacing?.marginLeft,
          borderWidth: metadata?.border?.width,
          borderStyle: metadata?.border?.style,
          borderColor: metadata?.border?.color,
          borderRadius: metadata?.border?.radius,
          color: metadata?.textColor,
          backgroundColor: metadata?.backgroundColor,
        }}
        onClick={onClick}
        {...rest}
      >
        {text}
      </a>
    </div>
  );
};

ButtonLink.displayName = 'ButtonLink';

export { ButtonLink };
export default ButtonLink;
