import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { ContainerEditorProps } from '../types';
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

  // D&D props
  droppableId,
  isDropDisabled
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
  const { isEmpty } = useContainerLogic(blockId, allBlocks);

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
    'relative group',
    editorMode && 'cursor-pointer transition-all duration-200',
    isSelected && 'ring-2 ring-blue-500 ring-offset-2',
    isSelected && 'bg-blue-50 dark:bg-blue-900/20',
    editorMode && !isSelected && 'hover:ring-2 hover:ring-blue-300 hover:ring-opacity-50'
  ].filter(Boolean).join(' ');

  // Стили для drop-зоны
  const dropZoneStyles = isOver ? 'ring-2 ring-green-400 ring-offset-2 bg-green-50 dark:bg-green-900/20' : '';

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
        className={`${containerClassName} ${dropZoneStyles}`}
        style={style}
        droppableId={droppableId}
        isDropDisabled={isDropDisabled}
        blockId={blockId}
      >
        {/* Рендерим дочерние блоки в режиме редактора */}
        {editorMode ? (
          <>
            {children}
            {/* Улучшенный плейсхолдер для пустого контейнера */}
            {isEmpty && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <div className="text-4xl mb-2">📦</div>
                <p className="font-medium text-lg">Пустой контейнер</p>
                <p className="text-sm mt-1 max-w-md mx-auto">
                  Перетащите блоки из библиотеки или используйте кнопку "+" для добавления контента
                </p>
                <div className="mt-3 text-xs text-gray-400">
                  Layout: {layout} • Gap: {gap} • Padding: {padding}
                </div>
              </div>
            )}
          </>
        ) : (
          /* В режиме просмотра просто рендерим children */
          children
        )}

        {/* Индикатор режима редактора */}
        {editorMode && isSelected && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg z-10">
            📦 Контейнер ({layout})
          </div>
        )}

        {/* Индикатор при hover */}
        {editorMode && !isSelected && (
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            📦 {title || 'Контейнер'}
          </div>
        )}

        {/* Индикатор drop-зоны */}
        {isOver && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
              ⬇️ Разместить здесь
            </div>
          </div>
        )}
      </ContainerBlock>
    </div>
  );
};

ContainerBlockEditor.displayName = 'ContainerBlockEditor';

export { ContainerBlockEditor };
export default ContainerBlockEditor;