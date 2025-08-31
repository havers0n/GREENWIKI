import type { BlockNode } from '../../types/api';

/**
 * Утилиты для работы с древовидной структурой блоков
 * Все операции иммутабельны и возвращают новые объекты
 */

/**
 * Рекурсивно ищет блок по ID во всем дереве
 */
export function findBlockById(tree: BlockNode[], blockId: string): BlockNode | null {
  for (const node of tree) {
    if (node.id === blockId) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const found = findBlockById(node.children, blockId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Строит путь от корня до указанного блока
 * Возвращает массив блоков: [root, parent1, parent2, ..., targetBlock]
 */
export function getBlockPath(tree: BlockNode[], blockId: string): BlockNode[] {
  // Рекурсивная функция для поиска пути
  function findPath(nodes: BlockNode[], targetId: string, currentPath: BlockNode[] = []): BlockNode[] | null {
    for (const node of nodes) {
      // Добавляем текущий узел в путь
      const newPath = [...currentPath, node];

      // Если нашли целевой блок, возвращаем путь
      if (node.id === targetId) {
        return newPath;
      }

      // Рекурсивно ищем в дочерних узлах
      if (node.children && node.children.length > 0) {
        const childPath = findPath(node.children, targetId, newPath);
        if (childPath) {
          return childPath;
        }
      }
    }
    return null;
  }

  return findPath(tree, blockId) || [];
}

/**
 * Рекурсивно ищет родительский узел для блока с указанным ID
 */
export function findBlockParent(tree: BlockNode[], blockId: string): BlockNode | null {
  for (const node of tree) {
    // Проверяем, есть ли искомый блок среди прямых потомков
    if (node.children.some(child => child.id === blockId)) {
      return node;
    }
    // Рекурсивно ищем в дочерних узлах
    if (node.children && node.children.length > 0) {
      const found = findBlockParent(node.children, blockId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Возвращает прямых потомков для заданного родителя
 * Если parentId равно null, возвращает корневые узлы
 */
export function getBlocksByParentId(tree: BlockNode[], parentId: string | null): BlockNode[] {
  if (parentId === null) {
    // Возвращаем корневые узлы (те, что не имеют родителя)
    return tree.filter(node => !findBlockParent(tree, node.id));
  }

  const parent = findBlockById(tree, parentId);
  return parent ? parent.children : [];
}

/**
 * Добавляет новый блок в дерево в указанную позицию
 */
export function addBlockToTree(
  tree: BlockNode[],
  newBlock: BlockNode,
  parentId: string | null,
  position: number
): BlockNode[] {
  if (parentId === null) {
    // Добавляем в корень дерева
    const newTree = [...tree];
    newTree.splice(position, 0, newBlock);
    return newTree;
  }

  // Добавляем как дочерний элемент
  return tree.map(node => {
    if (node.id === parentId) {
      const newChildren = [...node.children];
      newChildren.splice(position, 0, newBlock);
      return { ...node, children: newChildren };
    }

    if (node.children && node.children.length > 0) {
      return { ...node, children: addBlockToTree(node.children, newBlock, parentId, position) };
    }

    return node;
  });
}

/**
 * Обновляет свойства блока в дереве
 */
export function updateBlockInTree(
  tree: BlockNode[],
  blockId: string,
  updates: Partial<BlockNode>
): BlockNode[] {
  return tree.map(node => {
    if (node.id === blockId) {
      return { ...node, ...updates };
    }

    if (node.children && node.children.length > 0) {
      return { ...node, children: updateBlockInTree(node.children, blockId, updates) };
    }

    return node;
  });
}

/**
 * Удаляет блок из дерева
 */
export function removeBlockFromTree(tree: BlockNode[], blockId: string): BlockNode[] {
  return tree
    .filter(node => node.id !== blockId)
    .map(node => {
      if (node.children && node.children.length > 0) {
        return { ...node, children: removeBlockFromTree(node.children, blockId) };
      }
      return node;
    });
}

/**
 * Перемещает блок в дереве
 */
export function moveBlockInTree(
  tree: BlockNode[],
  blockId: string,
  newParentId: string | null,
  newPosition: number
): BlockNode[] {
  // Сначала находим блок для перемещения
  const blockToMove = findBlockById(tree, blockId);
  if (!blockToMove) {
    return tree;
  }

  // Удаляем блок из текущего места
  const treeWithoutBlock = removeBlockFromTree(tree, blockId);

  // Добавляем блок в новое место
  return addBlockToTree(treeWithoutBlock, blockToMove, newParentId, newPosition);
}

/**
 * Преобразует древовидную структуру в плоский массив для обратной совместимости
 */
export function flattenTree(tree: BlockNode[]): BlockNode[] {
  const result: BlockNode[] = [];

  function traverse(nodes: BlockNode[], parentId: string | null = null) {
    nodes.forEach((node, index) => {
      result.push({
        ...node,
        // Добавляем parentBlockId для обратной совместимости
        metadata: {
          ...node.metadata,
          parentBlockId: parentId,
          position: index
        }
      });

      if (node.children && node.children.length > 0) {
        traverse(node.children, node.id);
      }
    });
  }

  traverse(tree);
  return result;
}

/**
 * Преобразует плоский массив в древовидную структуру
 */
export function buildTreeFromFlat(flatBlocks: BlockNode[]): BlockNode[] {
  const blockMap = new Map<string, BlockNode>();
  const rootBlocks: BlockNode[] = [];

  // Сначала создаем все узлы
  flatBlocks.forEach(block => {
    const node: BlockNode = {
      ...block,
      children: []
    };
    blockMap.set(block.id, node);
  });

  // Затем строим иерархию
  flatBlocks.forEach(block => {
    const node = blockMap.get(block.id)!;
    const parentId = block.metadata?.parentBlockId;

    if (parentId && blockMap.has(parentId)) {
      const parent = blockMap.get(parentId)!;
      parent.children.push(node);
    } else {
      rootBlocks.push(node);
    }
  });

  // Сортируем дочерние элементы по позиции
  function sortChildren(nodes: BlockNode[]): void {
    nodes.forEach(node => {
      if (node.children.length > 0) {
        node.children.sort((a, b) => (a.metadata?.position || 0) - (b.metadata?.position || 0));
        sortChildren(node.children);
      }
    });
  }

  sortChildren(rootBlocks);
  return rootBlocks;
}
