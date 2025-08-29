import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ContentItem, BlockData, BlockNode, LayoutApiResponse } from '../../types/api';
import {
  addBlockToTree as addBlockToTreeUtil,
  updateBlockInTree as updateBlockInTreeUtil,
  removeBlockFromTree as removeBlockFromTreeUtil,
  moveBlockInTree as moveBlockInTreeUtil,
  flattenTree,
  buildTreeFromFlat
} from './treeUtils';

interface ContentState {
  // Список контента
  items: ContentItem[];
  currentItem: ContentItem | null;

  // Дерево блоков для текущей страницы (единственный источник правды)
  blockTree: BlockNode[];

  // Состояние загрузки
  loading: {
    list: boolean;
    item: boolean;
    save: boolean;
    publish: boolean;
  };

  // Ошибки
  errors: {
    list?: string;
    item?: string;
    save?: string;
    publish?: string;
  };

  // Фильтры и пагинация
  filters: {
    type?: string;
    status?: 'draft' | 'published' | 'archived';
    author?: string;
    search?: string;
  };

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Флаги состояния
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
}

const initialState: ContentState = {
  items: [],
  currentItem: null,
  blockTree: [],

  loading: {
    list: false,
    item: false,
    save: false,
    publish: false,
  },

  errors: {},

  filters: {},

  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

  hasUnsavedChanges: false,
  lastSaved: null,
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    // Установка списка контента
    setContentItems: (state, action: PayloadAction<ContentItem[]>) => {
      state.items = action.payload;
    },

    // Добавление контента
    addContentItem: (state, action: PayloadAction<ContentItem>) => {
      state.items.unshift(action.payload);
      state.hasUnsavedChanges = true;
    },

    // Обновление контента
    updateContentItem: (state, action: PayloadAction<ContentItem>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
        state.hasUnsavedChanges = true;
      }
    },

    // Удаление контента
    removeContentItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.hasUnsavedChanges = true;
    },

    // Установка текущего элемента
    setCurrentItem: (state, action: PayloadAction<ContentItem | null>) => {
      state.currentItem = action.payload;
    },

    // Управление деревом блоков (единственная структура)
    setBlockTree: (state, action: PayloadAction<BlockNode[]>) => {
      state.blockTree = action.payload;
    },

    // Загрузка дерева из API
    setLayoutFromApi: (state, action: PayloadAction<LayoutApiResponse>) => {
      state.blockTree = action.payload.blocks;
    },

    // Добавление блока в дерево
    addBlockToTree: (state, action: PayloadAction<{
      block: BlockNode;
      parentId: string | null;
      position: number;
    }>) => {
      const { block, parentId, position } = action.payload;
      state.blockTree = addBlockToTreeUtil(state.blockTree, block, parentId, position);
      state.hasUnsavedChanges = true;
    },

    // Обновление блока в дереве
    updateBlockInTree: (state, action: PayloadAction<{
      blockId: string;
      updates: Partial<BlockNode>;
    }>) => {
      const { blockId, updates } = action.payload;
      state.blockTree = updateBlockInTreeUtil(state.blockTree, blockId, updates);
      state.hasUnsavedChanges = true;
    },

    // Удаление блока из дерева
    removeBlockFromTree: (state, action: PayloadAction<string>) => {
      state.blockTree = removeBlockFromTreeUtil(state.blockTree, action.payload);
      state.hasUnsavedChanges = true;
    },

    // Перемещение блока в дереве
    moveBlockInTree: (state, action: PayloadAction<{
      blockId: string;
      newParentId: string | null;
      newPosition: number;
    }>) => {
      const { blockId, newParentId, newPosition } = action.payload;
      state.blockTree = moveBlockInTreeUtil(state.blockTree, blockId, newParentId, newPosition);
      state.hasUnsavedChanges = true;
    },

    // Управление переопределениями (overrides)
    updateBlockOverrides: (state, action: PayloadAction<{
      blockId: string;
      overrides: Record<string, any>;
    }>) => {
      const { blockId, overrides } = action.payload;
      state.blockTree = updateBlockInTreeUtil(state.blockTree, blockId, { overrides });
      state.hasUnsavedChanges = true;
    },

    setBlockOverride: (state, action: PayloadAction<{
      blockId: string;
      path: string;
      value: any;
    }>) => {
      const { blockId, path, value } = action.payload;
      const block = findBlockById(state.blockTree, blockId);
      if (block) {
        const currentOverrides = block.overrides || {};
        const newOverrides = { ...currentOverrides, [path]: value };
        state.blockTree = updateBlockInTreeUtil(state.blockTree, blockId, { overrides: newOverrides });
        state.hasUnsavedChanges = true;
      }
    },

    removeBlockOverride: (state, action: PayloadAction<{
      blockId: string;
      path: string;
    }>) => {
      const { blockId, path } = action.payload;
      const block = findBlockById(state.blockTree, blockId);
      if (block && block.overrides) {
        const newOverrides = { ...block.overrides };
        delete newOverrides[path];
        state.blockTree = updateBlockInTreeUtil(state.blockTree, blockId, { overrides: newOverrides });
        state.hasUnsavedChanges = true;
      }
    },

    clearBlockOverrides: (state, action: PayloadAction<string>) => {
      const blockId = action.payload;
      state.blockTree = updateBlockInTreeUtil(state.blockTree, blockId, { overrides: {} });
      state.hasUnsavedChanges = true;
    },

    // Управление загрузкой
    setLoading: (state, action: PayloadAction<{ key: keyof ContentState['loading']; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value;
    },

    // Управление ошибками
    setError: (state, action: PayloadAction<{ key: keyof ContentState['errors']; value: string }>) => {
      state.errors[action.payload.key] = action.payload.value;
    },

    clearError: (state, action: PayloadAction<keyof ContentState['errors']>) => {
      delete state.errors[action.payload];
    },

    // Фильтры
    setFilters: (state, action: PayloadAction<Partial<ContentState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Сброс на первую страницу при изменении фильтров
    },

    clearFilters: (state) => {
      state.filters = {};
      state.pagination.page = 1;
    },

    // Пагинация
    setPagination: (state, action: PayloadAction<Partial<ContentState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    // Управление сохранением
    setHasUnsavedChanges: (state, action: PayloadAction<boolean>) => {
      state.hasUnsavedChanges = action.payload;
    },

    setLastSaved: (state, action: PayloadAction<Date>) => {
      state.lastSaved = action.payload;
      state.hasUnsavedChanges = false;
    },

    // Сброс состояния
    resetContentState: () => initialState,
  },
});

export const {
  // Content management
  setContentItems,
  addContentItem,
  updateContentItem,
  removeContentItem,
  setCurrentItem,

  // Tree block management (единственные экшены)
  setBlockTree,
  setLayoutFromApi,
  addBlockToTree,
  updateBlockInTree,
  removeBlockFromTree,
  moveBlockInTree,

  // Overrides management
  updateBlockOverrides,
  setBlockOverride,
  removeBlockOverride,
  clearBlockOverrides,

  // Loading and error management
  setLoading,
  setError,
  clearError,
  setFilters,
  clearFilters,
  setPagination,
  setHasUnsavedChanges,
  setLastSaved,
  resetContentState,
} = contentSlice.actions;

export default contentSlice.reducer;
