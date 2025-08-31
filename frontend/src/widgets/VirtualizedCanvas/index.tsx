import React, { useRef, useMemo, useCallback, useState } from 'react';
import type { BlockNode } from '../../../types/api';
import { useDroppable } from '@dnd-kit/core';
import RenderBlockNode from '../BlockRenderer/ui/RenderBlockNode';
import DropZone from '../BlockRenderer/ui/DropZone';
import { blockRegistry } from '../../shared/config/blockRegistry';
import { useDynamicVirtualizer } from './useDynamicVirtualizer';

interface VirtualizedCanvasProps {
  blockTree: BlockNode[];
  /** Включает режим редактора: клики по блокам выбирают их, выбранный подсвечивается */
  editorMode?: boolean;
  /** ID выбранного блока для подсветки */
  selectedBlockId?: string | null;
  /** Колбэк выбора блока по клику в превью (null — снять выделение) */
  onSelectBlock?: (id: string | null) => void;
  /** Колбэк обновления контента блока */
  onUpdateBlock?: (updated: BlockNode) => void;
  /** Флаг перетаскивания над канвасом */
  isCanvasOver?: boolean;
}

/**
 * VirtualizedCanvas - виртуализированный компонент для эффективного рендеринга большого количества блоков
 * Использует @tanstack/react-virtual для оптимизации производительности
 */
export const VirtualizedCanvas: React.FC<VirtualizedCanvasProps> = ({
  blockTree,
  editorMode = false,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
  isCanvasOver = false
}) => {
  // Создаем плоский массив всех блоков для виртуализации
  const flattenedBlocks = useMemo(() => {
    const result: Array<{ block: BlockNode; depth: number; index: number }> = [];

    const flattenBlocks = (blocks: BlockNode[], depth: number = 0): void => {
      blocks.forEach((block, index) => {
        result.push({ block, depth, index });

        if (block.children && block.children.length > 0) {
          flattenBlocks(block.children, depth + 1);
        }
      });
    };

    flattenBlocks(blockTree);
    return result;
  }, [blockTree, editorMode]);

  // Обработчик изменения размера блока
  const handleSizeChange = useCallback((blockId: string, height: number) => {
    // Зарезервировано под динамическое измерение элементов
    // (в текущей версии только уведомляем внешний колбэк, если потребуется)
  }, []);

  // Используем динамический виртуализатор
  const dynamicVirtualizer = useDynamicVirtualizer({
    blocks: flattenedBlocks.map(item => item.block),
    estimateSize: 120, // Оценочная высота блока
    overscan: 5,
    onSizeChange: handleSizeChange,
  });

  const { setNodeRef } = useDroppable({
    id: 'canvas-dropzone',
    data: { type: 'canvas', accepts: ['block'] },
  });

  const { parentRef, registerElement, virtualizer } = {
    parentRef: dynamicVirtualizer.parentRef,
    registerElement: dynamicVirtualizer.registerElement,
    virtualizer: dynamicVirtualizer.virtualizer,
  };

  const virtualItems = virtualizer.getVirtualItems();

  // Комбинированный ref: droppable + scroll-контейнер для виртуализатора
  const setScrollAndDroppableRef = useCallback((node: HTMLDivElement | null) => {
    setNodeRef(node);
    if (node) parentRef.current = node;
  }, [setNodeRef, parentRef]);

  // Поиск пути к выбранному блоку для хлебных крошек
  const findPath = useCallback((nodes: BlockNode[], targetId: string): BlockNode[] | null => {
    for (const node of nodes) {
      if (node.id === targetId) return [node];
      if (node.children && node.children.length > 0) {
        const childPath = findPath(node.children, targetId);
        if (childPath) return [node, ...childPath];
      }
    }
    return null;
  }, []);

  const selectedPath = useMemo(() => {
    if (!selectedBlockId) return null;
    return findPath(blockTree, selectedBlockId) || null;
  }, [blockTree, selectedBlockId, findPath]);

  // Рендеринг хлебных крошек
  const renderBreadcrumbs = () => {
    if (!editorMode || !selectedPath || selectedPath.length === 0) return null;

    return (
      <div className="sticky top-0 z-10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 -mx-2 px-2 py-2 mb-2 rounded">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
          {selectedPath.map((node, index) => {
            const isLast = index === selectedPath.length - 1;
            const name = blockRegistry[node.block_type]?.name || node.block_type;
            return (
              <React.Fragment key={node.id}>
                <button
                  type="button"
                  className={`hover:underline ${isLast ? 'font-semibold text-gray-900 dark:text-white' : ''}`}
                  onClick={() => onSelectBlock?.(node.id)}
                  disabled={isLast}
                  title={name}
                >
                  {name}
                </button>
                {!isLast && <span className="text-gray-400">/</span>}
              </React.Fragment>
            );
          })}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-gray-400">Глубина:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              {Math.max(0, (selectedPath?.length || 1) - 1)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Если нет блоков, показываем пустое состояние
  if (blockTree.length === 0) {
    return (
      <div
        ref={setNodeRef}
        className={`
          min-h-full p-4 transition-colors duration-200
          ${isCanvasOver
            ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-400 rounded-lg'
            : 'border-2 border-transparent'
          }
        `}
      >
        <div className="flex items-center justify-center h-64 text-center text-gray-500 dark:text-gray-400">
          <div>
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-medium mb-2">Пустая страница</h3>
            <p className="text-sm">Перетащите блоки из библиотеки сюда или нажмите "➕ Добавить блок"</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {renderBreadcrumbs()}

      <div
        ref={setScrollAndDroppableRef}
        className={`
          min-h-full p-4 transition-colors duration-200 overflow-y-auto
          ${isCanvasOver
            ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-400 rounded-lg'
            : 'border-2 border-transparent'
          }
        `}
        style={{ height: '100%' }}
      >
        {/* Контейнер общей высоты для виртуалізації */}
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((vi) => {
            const item = flattenedBlocks[vi.index];
            if (!item) return null;
            const { block, depth } = item;

            return (
              <div
                key={block.id}
                ref={(el) => registerElement(el as HTMLElement | null, block.id, vi.index)}
                data-index={vi.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${vi.start}px)`,
                }}
              >
                {/* Drop zone перед первым корневым блоком */}
                {editorMode && vi.index === 0 && depth === 0 && (
                  <DropZone
                    parentId={null}
                    position={0}
                    className="mb-4"
                  />
                )}

                <RenderBlockNode
                  block={block}
                  depth={depth}
                  editorMode={editorMode}
                  selectedBlockId={selectedBlockId}
                  onSelectBlock={onSelectBlock}
                  onUpdateBlock={onUpdateBlock}
                />

                {/* Drop zone после блока */}
                {editorMode && (
                  <DropZone
                    parentId={block.id}
                    position={(block.children?.length || 0)}
                    className="mt-2"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Drop zone в конце, если есть блоки */}
        {editorMode && blockTree.length > 0 && (
          <DropZone
            parentId={null}
            position={blockTree.length}
            className="mt-4"
          />
        )}
      </div>
    </div>
  );
};

export default VirtualizedCanvas;
