import React from 'react';
import { Button } from 'shared/ui/atoms';

interface ButtonBlockProps {
  text: string;
  link: string;
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  metadata?: Record<string, unknown>;
}

const ButtonBlock: React.FC<ButtonBlockProps> = ({ text, link, variant, size, metadata = {} }) => {
  const handleClick = (e: React.MouseEvent) => {
    if (!link || link === '#') {
      e.preventDefault();
      return;
    }

    // Если ссылка внешняя, открываем в новой вкладке
    if (link.startsWith('http')) {
      e.preventDefault();
      window.open(link, '_blank', 'noopener,noreferrer');
    }
    // Для внутренних ссылок позволяем стандартную навигацию
  };

  // Генерация стилей из metadata
  const generateStyles = () => {
    const styles: React.CSSProperties = {};

    // Spacing
    const spacing = metadata.spacing as Record<string, string> | undefined;
    if (spacing) {
      if (spacing.marginTop) styles.marginTop = spacing.marginTop;
      if (spacing.marginRight) styles.marginRight = spacing.marginRight;
      if (spacing.marginBottom) styles.marginBottom = spacing.marginBottom;
      if (spacing.marginLeft) styles.marginLeft = spacing.marginLeft;
    }

    // Border
    const border = metadata.border as Record<string, string> | undefined;
    if (border) {
      if (border.width && border.style && border.style !== 'none') {
        styles.borderWidth = border.width;
        styles.borderStyle = border.style;
        if (border.color) styles.borderColor = border.color;
      }
      if (border.radius) styles.borderRadius = border.radius;
    }

    // Text color
    const textColor = metadata.textColor as string | undefined;
    if (textColor) {
      styles.color = textColor;
    }

    return styles;
  };

  const buttonStyles = generateStyles();

  if (link && link !== '#' && !link.startsWith('http')) {
    // Внутренняя ссылка - используем обычную ссылку со стилями кнопки
    return (
      <div className="flex justify-start">
        <a
          href={link}
          className={`inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            size === 'sm' ? 'text-sm px-3 py-1.5' :
            size === 'lg' ? 'text-base px-5 py-2.5' :
            'text-sm px-4 py-2'
          } ${
            variant === 'primary' ? 'bg-majestic-pink text-white hover:bg-majestic-pink/90' :
            variant === 'secondary' ? 'bg-majestic-gray-200 text-majestic-dark hover:bg-majestic-gray-300' :
            variant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' :
            'bg-transparent text-majestic-dark hover:bg-majestic-gray-200'
          }`}
          style={buttonStyles}
        >
          {text || 'Кнопка'}
        </a>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        style={buttonStyles}
      >
        {text || 'Кнопка'}
      </Button>
    </div>
  );
};

export default ButtonBlock;
