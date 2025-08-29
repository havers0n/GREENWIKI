import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';
import type { BlockNode } from '../types/api';

// Типизированные hooks для использования в компонентах
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Специализированные селекторы для удобства
export const useContent = () => useAppSelector(state => state.content);
export const useUI = () => useAppSelector(state => state.ui);
export const useEditor = () => useAppSelector(state => state.editor);
export const useUser = () => useAppSelector(state => state.user);

// Селекторы для конкретных полей
export const useCurrentUser = () => useAppSelector(state => state.user.currentUser);
export const useIsAuthenticated = () => useAppSelector(state => state.user.isAuthenticated);
export const useTheme = () => useAppSelector(state => state.ui.theme);
export const useSelectedBlockId = () => useAppSelector(state => state.editor.selectedBlockId);
export const useEditorMode = () => useAppSelector(state => state.editor.mode);
export const useNotifications = () => useAppSelector(state => state.ui.notifications);
export const useGlobalLoading = () => useAppSelector(state => state.ui.loading.global);
export const useSidebarState = () => useAppSelector(state => state.ui.sidebar);

// Селекторы для API состояния
export const useApiQueries = () => useAppSelector(state => state.api.queries);
export const useApiMutations = () => useAppSelector(state => state.api.mutations);

// Хуки для работы с древовидной структурой блоков
export const useBlockTree = () => useAppSelector(state => state.content.blockTree);

export const useSelectedBlock = (): BlockNode | null => {
  return useAppSelector(state => {
    const selectedBlockId = state.editor.selectedBlockId;
    if (!selectedBlockId) return null;

    // Рекурсивный поиск в дереве
    function findBlock(nodes: BlockNode[]): BlockNode | null {
      for (const node of nodes) {
        if (node.id === selectedBlockId) return node;
        if (node.children && node.children.length > 0) {
          const found = findBlock(node.children);
          if (found) return found;
        }
      }
      return null;
    }

    return findBlock(state.content.blockTree);
  });
};

export const useSelectedBlocks = (): BlockNode[] => {
  return useAppSelector(state => {
    const selectedBlockIds = state.editor.selectedBlocks;

    function findBlock(nodes: BlockNode[], id: string): BlockNode | null {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children && node.children.length > 0) {
          const found = findBlock(node.children, id);
          if (found) return found;
        }
      }
      return null;
    }

    return selectedBlockIds
      .map(id => findBlock(state.content.blockTree, id))
      .filter((block): block is BlockNode => block !== null);
  });
};

export const useRootBlocks = () => {
  return useAppSelector(state => {
    // Возвращаем корневые узлы (те, что не имеют родителя)
    function findRootBlocks(nodes: BlockNode[]): BlockNode[] {
      return nodes.filter(node => {
        // Проверяем, есть ли этот блок среди детей других блоков
        function isChildOfAnyParent(allNodes: BlockNode[], targetId: string): boolean {
          for (const parent of allNodes) {
            if (parent.children.some(child => child.id === targetId)) {
              return true;
            }
            if (parent.children && parent.children.length > 0) {
              if (isChildOfAnyParent(parent.children, targetId)) {
                return true;
              }
            }
          }
          return false;
        }
        return !isChildOfAnyParent(state.content.blockTree, node.id);
      });
    }

    return findRootBlocks(state.content.blockTree);
  });
};

export const useBlockById = (blockId: string): BlockNode | null => {
  return useAppSelector(state => {
    function findBlock(nodes: BlockNode[]): BlockNode | null {
      for (const node of nodes) {
        if (node.id === blockId) return node;
        if (node.children && node.children.length > 0) {
          const found = findBlock(node.children);
          if (found) return found;
        }
      }
      return null;
    }

    return findBlock(state.content.blockTree);
  });
};

export const useBlockChildren = (parentId: string | null): BlockNode[] => {
  return useAppSelector(state => {
    if (parentId === null) {
      // Возвращаем корневые блоки
      function findRootBlocks(nodes: BlockNode[]): BlockNode[] {
        return nodes.filter(node => {
          function isChildOfAnyParent(allNodes: BlockNode[], targetId: string): boolean {
            for (const parent of allNodes) {
              if (parent.children.some(child => child.id === targetId)) {
                return true;
              }
              if (parent.children && parent.children.length > 0) {
                if (isChildOfAnyParent(parent.children, targetId)) {
                  return true;
                }
              }
            }
            return false;
          }
          return !isChildOfAnyParent(state.content.blockTree, node.id);
        });
      }
      return findRootBlocks(state.content.blockTree);
    }

    // Ищем дочерние блоки для конкретного родителя
    function findChildren(nodes: BlockNode[]): BlockNode[] {
      for (const node of nodes) {
        if (node.id === parentId) {
          return node.children;
        }
        if (node.children && node.children.length > 0) {
          const found = findChildren(node.children);
          if (found.length > 0) return found;
        }
      }
      return [];
    }

    return findChildren(state.content.blockTree);
  });
};
