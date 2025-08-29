import * as React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { ContainerProps, ContainerLayout, ContainerGap, ContainerPadding } from '../types/index';
import { useContainerStyles } from '../model/useContainerLogic';

/**
 * Чистый UI компонент ContainerBlock
 * Отвечает только за рендеринг контейнера и его дочерних элементов
 */
const ContainerBlock: React.FC<ContainerProps> = ({
  children,
  layout = 'vertical',
  gap = 'medium',
  padding = 'medium',
  backgroundColor,
  borderRadius,
  maxWidth,
  title,
  className,
  style,
  // D&D props
  droppableId,
  isDropDisabled,
  // CMS-specific props
  blockId,
  ...rest
}) => {
  // D&D hooks
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging
  } = useDraggable({
    id: blockId || 'container-block',
    disabled: isDropDisabled,
  });

  const {
    setNodeRef: setDroppableRef,
    isOver
  } = useDroppable({
    id: droppableId || blockId || 'container-droppable',
    disabled: isDropDisabled,
  });

  // Получаем стили через хук
  const containerStyles = useContainerStyles(
    layout,
    gap,
    padding,
    backgroundColor,
    borderRadius,
    maxWidth
  );

  // Объединяем стили с D&D transform
  const combinedStyles = {
    ...containerStyles,
    ...style,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={(node) => {
        setDraggableRef(node);
        setDroppableRef(node);
      }}
      className={`${className || ''} ${isOver ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
      style={combinedStyles}
      data-block-id={blockId}
      {...attributes}
      {...listeners}
      {...rest}
    >
      {title && (
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {title}
        </h2>
      )}

      {children}
    </div>
  );
};

ContainerBlock.displayName = 'ContainerBlock';

export { ContainerBlock };
export default ContainerBlock;
