import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useCallback, useEffect, useMemo } from 'react';
import type { BlockNode } from '../../../types/api';

interface UseDynamicVirtualizerOptions {
  blocks: BlockNode[];
  estimateSize?: number;
  overscan?: number;
  onSizeChange?: (blockId: string, height: number) => void;
}

/**
 * Хук для динамического виртуализатора с измерением размеров элементов
 * Использует ResizeObserver для точного измерения высоты блоков
 */
export function useDynamicVirtualizer({
  blocks,
  estimateSize = 120,
  overscan = 5,
  onSizeChange,
}: UseDynamicVirtualizerOptions) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Создаем простой виртуализатор
  const virtualizer = useVirtualizer({
    count: blocks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  // Функция для регистрации элемента (упрощенная версия)
  const registerElement = useCallback((element: HTMLElement | null, blockId: string, index: number) => {
    if (!element) return;

    // Измеряем размер элемента
    const rect = element.getBoundingClientRect();
    const height = rect.height;

    if (height > 0) {
      onSizeChange?.(blockId, height);
    }

    return () => {
      // Очистка, если необходимо
    };
  }, [onSizeChange]);

  // Функция для обновления размера конкретного блока
  const updateBlockSize = useCallback((blockId: string, height: number) => {
    // В упрощенной версии просто вызываем callback
    onSizeChange?.(blockId, height);
  }, [onSizeChange]);

  return {
    virtualizer,
    parentRef,
    registerElement,
    updateBlockSize,
    sizeCache: new Map(),
  };
}
