import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useColumnsStyles, useColumnSlots } from '../model/useColumnsLogic';
import type { ColumnsProps } from '../types';
import DropZone from '../../../../widgets/BlockRenderer/ui/DropZone';
import RenderBlockNode from '../../../../widgets/BlockRenderer/ui/RenderBlockNode';

/**
 * ColumnsBlock - компонент для создания многоколоночных макетов
 * Использует CSS Grid для гибкого распределения колонок
 */
const ColumnsBlock: React.FC<ColumnsProps> = ({
  layout = 'two',
  gap = 'medium',
  backgroundColor,
  borderRadius,
  blockId,
  editorMode = false,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
  blockTree = [],
  className = '',
  style,
}) => {
  // Получаем стили и слоты для колонок
  const gridStyles = useColumnsStyles(layout, gap);
  const columnSlots = useColumnSlots(layout);

  // Создаем droppable область для всего блока колонок
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: blockId || 'columns-block',
  });

  // Объединяем стили
  const combinedStyles: React.CSSProperties = {
    ...gridStyles,
    backgroundColor,
    borderRadius,
    minHeight: editorMode ? '120px' : 'auto',
    ...style,
  };

  // Объединяем классы
  const combinedClassName = [
    'columns-block',
    editorMode ? 'relative border-2 border-gray-200 rounded-lg' : '',
    isOver ? 'border-blue-400 bg-blue-50' : '',
    className,
  ].filter(Boolean).join(' ');

  // Распределяем дочерние блоки по колонкам
  const getBlocksForSlot = (slotName: string) => {
    return blockTree.filter(child => child.slot === slotName);
  };

  return (
    <div
      ref={setDroppableRef}
      className={combinedClassName}
      style={combinedStyles}
      onClick={() => editorMode && onSelectBlock && onSelectBlock(blockId || null)}
    >
      {columnSlots.map((slotName, index) => {
        const slotBlocks = getBlocksForSlot(slotName);

        return (
          <div
            key={slotName}
            className="column-slot min-h-[80px] relative"
            style={editorMode ? {
              border: '1px dashed #d1d5db',
              borderRadius: '4px',
              padding: '8px',
            } : {}}
          >
            {editorMode && (
              <DropZone
                parentId={blockId ?? null}
                position={index}
                slotName={slotName}
                className="h-full"
                isEmpty={slotBlocks.length === 0}
              />
            )}

            {/* Рендерим дочерние блоки для этого слота */}
            <div className="column-content">
              {slotBlocks.map((childBlock, childIndex) => (
                <div className="column" key={childBlock.id}>
                  <RenderBlockNode
                    block={childBlock}
                    depth={0}
                    editorMode={editorMode}
                    selectedBlockId={selectedBlockId ?? undefined}
                    onSelectBlock={onSelectBlock}
                    onUpdateBlock={onUpdateBlock}
                  />
                  {editorMode && childIndex < slotBlocks.length - 1 && (
                    <DropZone
                      parentId={blockId ?? null}
                      position={childIndex + 1}
                      slotName={slotName}
                      className="my-2"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ColumnsBlock;
