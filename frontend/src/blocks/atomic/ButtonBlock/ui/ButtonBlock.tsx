import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Button } from '../../../../shared/ui/atoms/Button';
import { ButtonLink } from './ButtonLink';
import { useButtonBlockLogic } from '../model/useButtonBlockLogic';
import { useButtonBlockStyles } from '../model/useButtonBlockStyles';
import type { ButtonBlockProps } from '../types';

/**
 * ButtonBlock - чистый компонент кнопки для CMS
 * Использует базовый Button компонент без дублирования логики
 */
const ButtonBlock: React.FC<ButtonBlockProps> = ({
  text = 'Кнопка',
  link,
  linkTarget,
  variant = 'primary',
  size = 'md',
  metadata,
  className,
  style,
  onClick,
  blockId,
  ...rest
}) => {
  // D&D hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: blockId || 'button-block',
  });

  // Используем хуки для логики и стилей
  const { linkConfig, handleClick } = useButtonBlockLogic(link, linkTarget, onClick);
  const { buttonStyles, containerClassName } = useButtonBlockStyles(metadata, className);

  // Объединяем стили с D&D transform
  const combinedStyles = {
    ...style,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  // Для внутренних ссылок используем ButtonLink
  if (linkConfig.type === 'internal') {
    return (
      <div
        ref={setNodeRef}
        className={containerClassName}
        style={combinedStyles}
        {...attributes}
        {...listeners}
      >
        <ButtonLink
          text={text}
          link={linkConfig.url}
          variant={variant}
          size={size}
          metadata={metadata}
          onClick={handleClick}
          blockId={blockId}
          {...rest}
        />
      </div>
    );
  }

  // Для внешних ссылок или отсутствия ссылки используем обычный Button
  return (
    <div
      ref={setNodeRef}
      className={containerClassName}
      style={combinedStyles}
      {...attributes}
      {...listeners}
    >
      <Button
        variant={variant}
        size={size}
        onClick={handleClick}
        style={buttonStyles}
        data-block-id={blockId}
        {...rest}
      >
        {text}
      </Button>
    </div>
  );
};

ButtonBlock.displayName = 'ButtonBlock';

export { ButtonBlock };
export default ButtonBlock;
