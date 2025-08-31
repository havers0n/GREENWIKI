import React from 'react';
import type { ButtonBlockProps } from '../types';

/**
 * ButtonLink - компонент для рендеринга кнопки как ссылки
 * Используется для внутренних ссылок со стилями кнопки
 */
const ButtonLink: React.FC<ButtonBlockProps> = ({
  text = 'Кнопка',
  link,
  className,
  style,
  onClick
}) => {
  // Проверяем, что у нас есть ссылка
  if (!link || link === '#') {
    return null;
  }

  return (
    <div className={className || 'flex justify-start'} style={style}>
      <a
        href={link}
        className="inline-flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        onClick={onClick}
      >
        {text}
      </a>
    </div>
  );
};

ButtonLink.displayName = 'ButtonLink';

export { ButtonLink };
export default ButtonLink;