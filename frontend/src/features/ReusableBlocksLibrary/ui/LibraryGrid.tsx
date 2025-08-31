import React from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { BlockCard } from '../BlockCard';

import type { LibraryGridProps } from '../types';

/**
 * Компонент сетки блоков
 * Отвечает за отображение блоков в обычной или виртуализированной сетке
 */
const LibraryGrid: React.FC<LibraryGridProps> = ({
  blocks,
  loading = false,
  virtualized = false,
  gridConfig
}) => {
  // Всегда вызываем хуки на верхнем уровне, независимо от условий
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: blocks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200 + 16, // CARD_HEIGHT + ROW_GAP
    overscan: 5,
  });

  if (loading && blocks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">
          Загрузка блоков...
        </span>
      </div>
    );
  }

  if (blocks.length === 0) {
    return null; // Пустые состояния обрабатываются в родительском компоненте
  }

  if (virtualized && gridConfig) {
    // Виртуализированная сетка для большого количества блоков с @tanstack/react-virtual

    return (
      <div className="mb-6">
        <div
          ref={parentRef}
          style={{
            height: gridConfig.height,
            width: gridConfig.width,
            overflow: 'auto',
          }}
          className="mb-6"
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const block = blocks[virtualItem.index];
              if (!block) return null;

              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${320 + 16}px`, // CARD_WIDTH + COLUMN_GAP
                    height: `${200 + 16}px`, // CARD_HEIGHT + ROW_GAP
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  className="p-2"
                >
                  <BlockCard block={block} />
                </div>
              );
            })}
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Показано {blocks.length} блоков (виртуализированная сетка)
        </div>
      </div>
    );
  }

  // Обычная сетка для небольшого количества блоков
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {blocks.map((block) => (
        <BlockCard key={block.id} block={block} />
      ))}
    </div>
  );
};

LibraryGrid.displayName = 'LibraryGrid';

export { LibraryGrid };
export default LibraryGrid;
