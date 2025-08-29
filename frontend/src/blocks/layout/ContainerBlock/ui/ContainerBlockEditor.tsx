import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { ContainerEditorProps } from '../types/index';
import { useContainerLogic } from '../model/useContainerLogic';
import { ContainerBlock } from './ContainerBlock';

/**
 * ContainerBlockEditor - компонент для CMS редактора
 * Комбинирует чистый ContainerBlock с логикой редактирования
 */
const ContainerBlockEditor: React.FC<ContainerEditorProps> = ({
  // Container props
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

  // Editor props
  editorMode = false,
  blockId,
  allBlocks = [],
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
  onUpdateContent,

  // D&D props
  droppableId,
  isDropDisabled,

  ...rest
}) => {
  // D&D droppable hook
  const {
    setNodeRef,
    isOver
  } = useDroppable({
    id: droppableId || blockId || 'container-editor',
    disabled: isDropDisabled,
  });

  // Используем логику контейнера
  const { childBlocks, isEmpty } = useContainerLogic(blockId, allBlocks);

  // Обработчик клика по контейнеру
  const handleContainerClick = (event: React.MouseEvent) => {
    if (editorMode && onSelectBlock) {
      event.stopPropagation();
      onSelectBlock(blockId || null);
    }
  };

  // Определяем, выбран ли этот контейнер
  const isSelected = selectedBlockId === blockId;

  // Формируем классы для выделения
  const containerClassName = [
    className,
    'relative',
    editorMode && 'cursor-pointer transition-all duration-200',
    isSelected && 'ring-2 ring-blue-500 ring-offset-2',
    isSelected && 'bg-blue-50 dark:bg-blue-900/20'
  ].filter(Boolean).join(' ');

  return (
    <div ref={setNodeRef} onClick={handleContainerClick}>
      <ContainerBlock
        layout={layout}
        gap={gap}
        padding={padding}
        backgroundColor={backgroundColor}
        borderRadius={borderRadius}
        maxWidth={maxWidth}
        title={title}
        className={`${containerClassName} ${isOver ? 'ring-2 ring-green-400 ring-offset-2 bg-green-50 dark:bg-green-900/20' : ''}`}
        style={style}
        droppableId={droppableId}
        isDropDisabled={isDropDisabled}
        blockId={blockId}
        {...rest}
      >
        {/* Рендерим дочерние блоки в режиме редактора */}
        {editorMode ? (
          <>
            {children}
            {/* Плейсхолдер для пустого контейнера */}
            {isEmpty && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <div className="text-4xl mb-2">📦</div>
                <p className="font-medium">Контейнер пуст</p>
                <p className="text-sm mt-1">
                  Перетащите блоки сюда или нажмите "+" для добавления
                </p>
              </div>
            )}
          </>
        ) : (
          /* В режиме просмотра просто рендерим children */
          children
        )}

        {/* Индикатор режима редактора */}
        {editorMode && isSelected && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg">
            Контейнер
          </div>
        )}
      </ContainerBlock>
    </div>
  );
};

ContainerBlockEditor.displayName = 'ContainerBlockEditor';

export { ContainerBlockEditor };
export default ContainerBlockEditor;
