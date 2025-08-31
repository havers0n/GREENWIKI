import type { RootState } from '../index';
import type { BlockNode } from '../../types/api';
import {
  findBlockById,
  findBlockParent,
  getBlocksByParentId
} from '../slices/treeUtils';
import { mergeOverrides } from '../../shared/lib/utils';

/**
 * Селекторы для работы с древовидной структурой блоков
 */

// Базовые селекторы
export const selectBlockTree = (state: RootState): BlockNode[] => state.content.blockTree;
export const selectBlocksFlat = (state: RootState) => state.content.blockTree;

// Поиск блока по ID
export const selectBlockById = (state: RootState, blockId: string): BlockNode | null => {
  return findBlockById(state.content.blockTree, blockId);
};

// Поиск родительского блока
export const selectBlockParent = (state: RootState, blockId: string): BlockNode | null => {
  return findBlockParent(state.content.blockTree, blockId);
};

// Получение дочерних блоков
export const selectBlocksByParentId = (state: RootState, parentId: string | null): BlockNode[] => {
  return getBlocksByParentId(state.content.blockTree, parentId);
};

// Получение корневых блоков (без родителя)
export const selectRootBlocks = (state: RootState): BlockNode[] => {
  return getBlocksByParentId(state.content.blockTree, null);
};

// Получение выбранного блока из editor state
export const selectSelectedBlock = (state: RootState): BlockNode | null => {
  const selectedBlockId = state.editor.selectedBlockId;
  if (!selectedBlockId) return null;
  return selectBlockById(state, selectedBlockId);
};

// Мемоизированный селектор для получения блока с effectiveContent
export const selectBlockWithEffectiveContent = (state: RootState, blockId: string): BlockNode | null => {
  const block = selectBlockById(state, blockId);
  if (!block) return null;

  // Если блок является экземпляром (имеет instance_id), применяем переопределения
  if (block.instance_id && block.overrides) {
    // Мемоизация результата mergeOverrides для предотвращения лишних вычислений
    const mergedContent = mergeOverrides(block.content, block.overrides);
    return {
      ...block,
      content: mergedContent as any
    };
  }

  return block;
};

// Получение выбранного блока с effectiveContent
export const selectSelectedBlockWithEffectiveContent = (state: RootState): BlockNode | null => {
  const selectedBlockId = state.editor.selectedBlockId;
  if (!selectedBlockId) return null;
  return selectBlockWithEffectiveContent(state, selectedBlockId);
};

// Получение effectiveContent для блока
export const selectBlockEffectiveContent = (state: RootState, blockId: string): Record<string, any> | null => {
  const block = selectBlockWithEffectiveContent(state, blockId);
  return block?.content || null;
};

// Получение оригинального контента блока (без переопределений)
export const selectBlockOriginalContent = (state: RootState, blockId: string): Record<string, any> | null => {
  const block = selectBlockById(state, blockId);
  return block?.content || null;
};

// Получение переопределений для блока
export const selectBlockOverrides = (state: RootState, blockId: string): Record<string, any> | null => {
  const block = selectBlockById(state, blockId);
  return block?.overrides || null;
};

// Проверка, является ли блок экземпляром переиспользуемого блока
export const selectIsBlockInstance = (state: RootState, blockId: string): boolean => {
  const block = selectBlockById(state, blockId);
  return block?.instance_id !== null;
};

// Получение всех выбранных блоков
export const selectSelectedBlocks = (state: RootState): BlockNode[] => {
  const selectedBlockIds = state.editor.selectedBlocks;
  return selectedBlockIds
    .map(id => selectBlockById(state, id))
    .filter((block): block is BlockNode => block !== null);
};

// Получение блоков определенного типа
export const selectBlocksByType = (state: RootState, blockType: string): BlockNode[] => {
  const result: BlockNode[] = [];

  function traverse(nodes: BlockNode[]) {
    nodes.forEach(node => {
      if (node.block_type === blockType) {
        result.push(node);
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  }

  traverse(state.content.blockTree);
  return result;
};

// Получение блоков по статусу
export const selectBlocksByStatus = (state: RootState, status: string): BlockNode[] => {
  const result: BlockNode[] = [];

  function traverse(nodes: BlockNode[]) {
    nodes.forEach(node => {
      if (node.status === status) {
        result.push(node);
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  }

  traverse(state.content.blockTree);
  return result;
};

// Получение пути к блоку (цепочка родителей)
export const selectBlockPath = (state: RootState, blockId: string): BlockNode[] => {
  const path: BlockNode[] = [];
  let currentBlock = selectBlockById(state, blockId);

  while (currentBlock) {
    path.unshift(currentBlock);
    const parent = selectBlockParent(state, currentBlock.id);
    currentBlock = parent;
  }

  return path;
};

// Получение уровня вложенности блока
export const selectBlockDepth = (state: RootState, blockId: string): number => {
  const block = selectBlockById(state, blockId);
  return block?.depth || 0;
};

// Получение всех потомков блока (рекурсивно)
export const selectBlockDescendants = (state: RootState, blockId: string): BlockNode[] => {
  const block = selectBlockById(state, blockId);
  if (!block) return [];

  const descendants: BlockNode[] = [];

  function collectDescendants(nodes: BlockNode[]) {
    nodes.forEach(node => {
      descendants.push(node);
      if (node.children && node.children.length > 0) {
        collectDescendants(node.children);
      }
    });
  }

  if (block.children && block.children.length > 0) {
    collectDescendants(block.children);
  }

  return descendants;
};

// Проверка, является ли блок потомком другого блока
export const selectIsBlockDescendant = (
  state: RootState,
  blockId: string,
  ancestorId: string
): boolean => {
  const descendants = selectBlockDescendants(state, ancestorId);
  return descendants.some(descendant => descendant.id === blockId);
};

// Получение соседних блоков (на том же уровне)
export const selectBlockSiblings = (state: RootState, blockId: string): BlockNode[] => {
  const parent = selectBlockParent(state, blockId);
  const parentId = parent?.id || null;
  const siblings = selectBlocksByParentId(state, parentId);
  return siblings.filter(sibling => sibling.id !== blockId);
};

// Получение следующего блока на том же уровне
export const selectNextSibling = (state: RootState, blockId: string): BlockNode | null => {
  const parent = selectBlockParent(state, blockId);
  const parentId = parent?.id || null;
  const siblings = selectBlocksByParentId(state, parentId);
  const currentIndex = siblings.findIndex(sibling => sibling.id === blockId);

  if (currentIndex === -1 || currentIndex === siblings.length - 1) {
    return null;
  }

  return siblings[currentIndex + 1];
};

// Получение предыдущего блока на том же уровне
export const selectPreviousSibling = (state: RootState, blockId: string): BlockNode | null => {
  const parent = selectBlockParent(state, blockId);
  const parentId = parent?.id || null;
  const siblings = selectBlocksByParentId(state, parentId);
  const currentIndex = siblings.findIndex(sibling => sibling.id === blockId);

  if (currentIndex <= 0) {
    return null;
  }

  return siblings[currentIndex - 1];
};

// Получение всех блоков с определенным slot
export const selectBlocksBySlot = (state: RootState, slotName: string): BlockNode[] => {
  const result: BlockNode[] = [];

  function traverse(nodes: BlockNode[]) {
    nodes.forEach(node => {
      if (node.slot === slotName) {
        result.push(node);
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  }

  traverse(state.content.blockTree);
  return result;
};

// Проверка, пустое ли дерево
export const selectIsBlockTreeEmpty = (state: RootState): boolean => {
  return state.content.blockTree.length === 0;
};

// Получение количества блоков в дереве
export const selectBlockCount = (state: RootState): number => {
  let count = 0;

  function countNodes(nodes: BlockNode[]) {
    nodes.forEach(node => {
      count++;
      if (node.children && node.children.length > 0) {
        countNodes(node.children);
      }
    });
  }

  countNodes(state.content.blockTree);
  return count;
};

// Получение максимальной глубины дерева
export const selectMaxTreeDepth = (state: RootState): number => {
  let maxDepth = 0;

  function findDepth(nodes: BlockNode[], currentDepth: number) {
    nodes.forEach(node => {
      maxDepth = Math.max(maxDepth, currentDepth);
      if (node.children && node.children.length > 0) {
        findDepth(node.children, currentDepth + 1);
      }
    });
  }

  findDepth(state.content.blockTree, 0);
  return maxDepth;
};
