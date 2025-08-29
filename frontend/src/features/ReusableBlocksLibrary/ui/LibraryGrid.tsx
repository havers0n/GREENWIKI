import React from 'react';
import { Grid } from 'react-window';
import { BlockCard } from '../BlockCard';
import { BlockCardVirtual } from '../BlockCardVirtual';
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
    // Виртуализированная сетка для большого количества блоков
    return (
      <div className="mb-6">
        <Grid
          columnCount={gridConfig.columnCount}
          columnWidth={320 + 16} // CARD_WIDTH + COLUMN_GAP
          height={gridConfig.height}
          rowCount={gridConfig.rowCount}
          rowHeight={200 + 16} // CARD_HEIGHT + ROW_GAP
          width={gridConfig.width}
          itemData={{
            blocks,
            columnCount: gridConfig.columnCount,
          }}
          className="mb-6"
        >
          {BlockCardVirtual}
        </Grid>
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
