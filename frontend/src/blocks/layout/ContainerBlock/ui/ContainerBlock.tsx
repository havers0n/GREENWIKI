import * as React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { ContainerProps } from '../types';
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
  blockId
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
      className={`${className || ''} ${isOver ? 'ring-2 ring-blue-400 ring-offset-2' : ''} relative`}
      style={combinedStyles}
      data-block-id={blockId}
    >
      {/* Drag handle: перетаскивание начинается ТОЛЬКО отсюда */}
      <div
        className="absolute -left-6 top-2 w-4 h-4 rounded cursor-grab bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 shadow"
        title="Перетащить контейнер"
        {...attributes}
        {...listeners}
      />

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