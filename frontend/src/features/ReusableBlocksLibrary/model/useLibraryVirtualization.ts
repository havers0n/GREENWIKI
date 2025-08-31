import { useMemo } from 'react';
import type {
  UseLibraryVirtualizationResult,
  GridConfig,
  VirtualizationConfig,
} from '../types';
import type { ReusableBlock } from '../../../types/api';

/**
 * Хук для управления виртуализацией сетки блоков
 * Определяет, нужно ли использовать виртуализацию и рассчитывает параметры сетки
 */
export const useLibraryVirtualization = (
  blocks: ReusableBlock[]
): UseLibraryVirtualizationResult => {
  // Конфигурация виртуализации
  const virtualizationConfig: VirtualizationConfig = {
    threshold: 50, // Порог для включения виртуализации
    cardWidth: 320, // Ширина карточки блока
    cardHeight: 200, // Высота карточки блока
    columnGap: 16, // Отступ между колонками
    rowGap: 16, // Отступ между рядами
    containerWidth: 800, // Ширина контейнера (можно сделать адаптивной)
    maxHeight: 600, // Максимальная высота виртуализированной сетки
  };

  // Вычисляем параметры сетки для виртуализации
  const gridConfig: GridConfig | null = useMemo(() => {
    const { threshold, cardWidth, cardHeight, columnGap, rowGap, containerWidth, maxHeight } = virtualizationConfig;

    if (blocks.length <= threshold) {
      return null; // Используем обычный рендеринг
    }

    const columnCount = Math.floor((containerWidth + columnGap) / (cardWidth + columnGap));
    const rowCount = Math.ceil(blocks.length / columnCount);

    return {
      columnCount,
      rowCount,
      width: containerWidth,
      height: Math.min(rowCount * (cardHeight + rowGap), maxHeight),
    };
  }, [blocks.length, virtualizationConfig]);

  // Определяем, нужно ли использовать виртуализацию
  const shouldVirtualize = gridConfig !== null;

  return {
    gridConfig,
    shouldVirtualize,
    virtualizationConfig,
  };
};
