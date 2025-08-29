import { useMemo } from 'react';
import type { BlockNode } from '../../../../types/api';
import type { ContainerLayout, ContainerGap, ContainerPadding } from '../types';

/**
 * Хук для логики работы с контейнером
 * Отвечает за получение и фильтрацию дочерних блоков
 */
export const useContainerLogic = (
  blockId?: string,
  allBlocks: BlockNode[] = [],
  slot: string = 'default'
) => {
  // Получаем дочерние блоки для этого контейнера
  const childBlocks = useMemo(() => {
    if (!blockId) return [];

    return allBlocks.filter(block =>
      block.parent_block_id === blockId &&
      (!block.slot || block.slot === slot)
    );
  }, [blockId, allBlocks, slot]);

  // Проверяем, пустой ли контейнер
  const isEmpty = childBlocks.length === 0;

  // Получаем статистику по блокам
  const blockStats = useMemo(() => {
    const stats = {
      total: childBlocks.length,
      byType: {} as Record<string, number>
    };

    childBlocks.forEach(block => {
      const type = block.block_type || 'unknown';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
    });

    return stats;
  }, [childBlocks]);

  return {
    childBlocks,
    isEmpty,
    blockStats,
    hasChildren: !isEmpty
  };
};

/**
 * Хук для работы с D&D функциональностью контейнера
 */
export const useContainerDroppable = (
  blockId?: string,
  isDropDisabled?: boolean
) => {
  // В будущем здесь будет логика для D&D
  // Пока возвращаем базовые значения

  return {
    isOver: false,
    canDrop: !isDropDisabled,
    dropTargetId: blockId
  };
};

/**
 * Хук для стилизации контейнера
 */
export const useContainerStyles = (
  layout: ContainerLayout = 'vertical',
  gap: ContainerGap = 'medium',
  padding: ContainerPadding = 'medium',
  backgroundColor?: string,
  borderRadius?: string,
  maxWidth?: string
) => {
  const gapValues: Record<ContainerGap, string> = {
    none: '0',
    small: '0.5rem',
    medium: '1rem',
    large: '2rem'
  };

  const paddingValues: Record<ContainerPadding, string> = {
    none: '0',
    small: '0.5rem',
    medium: '1rem',
    large: '2rem'
  };

  const styles = {
    display: layout === 'horizontal' ? 'flex' : layout === 'grid' ? 'grid' : 'block',
    flexDirection: layout === 'horizontal' ? 'row' : undefined,
    gridTemplateColumns: layout === 'grid' ? 'repeat(auto-fit, minmax(250px, 1fr))' : undefined,
    gap: gapValues[gap],
    padding: paddingValues[padding],
    backgroundColor: backgroundColor || 'transparent',
    borderRadius: borderRadius || '0',
    maxWidth: maxWidth || 'none',
    margin: maxWidth ? '0 auto' : undefined,
  };

  return styles;
};
