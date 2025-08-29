import { useMemo } from 'react';
import type { LayoutBlock, UseBlockNavigationResult } from '../types';

/**
 * Хук для работы с навигацией по блокам
 * Отвечает за определение возможности перемещения блоков
 */
export const useBlockNavigation = (
  block: LayoutBlock | null,
  allBlocks: LayoutBlock[] = []
): UseBlockNavigationResult => {
  // Получаем все блоки страницы, отсортированные по позиции
  const pageBlocks = useMemo(() => {
    if (!block || !allBlocks.length) return [];

    return allBlocks
      .filter(b => b.page_id === block.page_id)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }, [block, allBlocks]);

  // Проверяем возможность перемещения влево
  const canMoveLeft = useMemo(() => {
    if (!block || !pageBlocks.length) return false;

    const currentIndex = pageBlocks.findIndex(b => b.id === block.id);
    return currentIndex > 0;
  }, [block, pageBlocks]);

  // Проверяем возможность перемещения вправо
  const canMoveRight = useMemo(() => {
    if (!block || !pageBlocks.length) return false;

    const currentIndex = pageBlocks.findIndex(b => b.id === block.id);
    return currentIndex >= 0 && currentIndex < pageBlocks.length - 1;
  }, [block, pageBlocks]);

  return {
    canMoveLeft: () => canMoveLeft,
    canMoveRight: () => canMoveRight,
    pageBlocks
  };
};

/**
 * Хук для обработки клавиатурных сокращений навигации
 */
export const useKeyboardNavigation = (
  onMoveLeft?: (blockId: string) => void,
  onMoveRight?: (blockId: string) => void,
  blockId?: string
) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!blockId) return;

    // Обработка стрелок влево/вправо
    if (event.key === 'ArrowLeft' && onMoveLeft) {
      event.preventDefault();
      onMoveLeft(blockId);
    }

    if (event.key === 'ArrowRight' && onMoveRight) {
      event.preventDefault();
      onMoveRight(blockId);
    }
  };

  return { handleKeyDown };
};
