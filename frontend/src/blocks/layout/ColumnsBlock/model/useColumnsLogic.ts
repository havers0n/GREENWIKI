// Логика для ColumnsBlock
import { useMemo } from 'react';
import type { ColumnsLayout, ColumnsGap } from '../types';

/**
 * Хук для вычисления стилей колонок
 */
export function useColumnsStyles(layout: ColumnsLayout = 'two', gap: ColumnsGap = 'medium') {
  return useMemo(() => {
    // Определяем количество колонок
    const columnsCount = {
      two: 2,
      three: 3,
      four: 4,
    }[layout];

    // Определяем gap между колонками
    const gapSize = {
      none: '0',
      small: '0.5rem',
      medium: '1rem',
      large: '1.5rem',
    }[gap];

    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${columnsCount}, 1fr)`,
      gap: gapSize,
      width: '100%',
    };
  }, [layout, gap]);
}

/**
 * Хук для получения названий слотов колонок
 */
export function useColumnSlots(layout: ColumnsLayout = 'two') {
  return useMemo(() => {
    const columnsCount = {
      two: 2,
      three: 3,
      four: 4,
    }[layout];

    return Array.from({ length: columnsCount }, (_, i) => `column${i + 1}`);
  }, [layout]);
}
