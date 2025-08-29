import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ReusableBlock } from '../../types/api';
import * as reusableBlocksApi from '../../shared/api/reusableBlocks';

// Интерфейс состояния библиотеки переиспользуемых блоков
interface ReusableBlocksState {
  // Список блоков
  items: ReusableBlock[];

  // Общее количество блоков (от API)
  count: number;

  // Категории (для фильтра)
  categories: string[];

  // Состояние загрузки
  loading: {
    fetch: boolean;
    instantiate: boolean;
  };

  // Ошибки
  errors: {
    fetch?: string;
    instantiate?: string;
  };

  // Фильтры и пагинация
  filters: {
    search?: string;
    category?: string;
    tags?: string[];
  };

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  // Флаг видимости модального окна библиотеки
  isLibraryOpen: boolean;
}

// Начальное состояние
const initialState: ReusableBlocksState = {
  items: [],
  count: 0,
  categories: [],
  loading: {
    fetch: false,
    instantiate: false,
  },
  errors: {},
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  isLibraryOpen: false,
};

// Async thunk для загрузки переиспользуемых блоков
export const fetchReusableBlocks = createAsyncThunk(
  'reusableBlocks/fetchReusableBlocks',
  async (params: {
    search?: string;
    category?: string;
    tags?: string[];
    page?: number;
    limit?: number;
  } = {}) => {
    return await reusableBlocksApi.fetchReusableBlocks(params);
  }
);

// Async thunk для создания экземпляра блока
export const instantiateReusableBlock = createAsyncThunk(
  'reusableBlocks/instantiateReusableBlock',
  async (params: {
    reusableBlockId: string;
    pageId: string;
    parentId?: string;
    position?: number;
    slot?: string;
    overrides?: Record<string, any>;
  }) => {
    return await reusableBlocksApi.instantiateReusableBlock(params);
  }
);

const reusableBlocksSlice = createSlice({
  name: 'reusableBlocks',
  initialState,
  reducers: {
    // Открытие/закрытие библиотеки
    setLibraryOpen: (state, action: PayloadAction<boolean>) => {
      state.isLibraryOpen = action.payload;
    },

    // Установка фильтров
    setFilters: (state, action: PayloadAction<Partial<ReusableBlocksState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Сбрасываем на первую страницу при изменении фильтров
    },

    // Очистка фильтров
    clearFilters: (state) => {
      state.filters = {};
      state.pagination.page = 1;
    },

    // Установка страницы
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },

    // Очистка ошибок
    clearErrors: (state) => {
      state.errors = {};
    },

    // Обновление счетчика использования блока
    incrementUsageCount: (state, action: PayloadAction<string>) => {
      const block = state.items.find(item => item.id === action.payload);
      if (block) {
        block.usage_count += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch reusable blocks
      .addCase(fetchReusableBlocks.pending, (state) => {
        state.loading.fetch = true;
        state.errors.fetch = undefined;
      })
      .addCase(fetchReusableBlocks.fulfilled, (state, action) => {
        state.loading.fetch = false;

        if (action.payload.meta?.pagination) {
          state.pagination = action.payload.meta.pagination;
        }

        // Правильно извлекаем данные из вложенной структуры
        state.items = action.payload.data?.items || [];
        state.count = action.payload.data?.count || 0;

        // Обновляем пагинацию на основе общего количества
        if (state.pagination.total !== state.count) {
          state.pagination.total = state.count;
          state.pagination.totalPages = Math.ceil(state.count / state.pagination.limit);
          state.pagination.hasNext = state.pagination.page < state.pagination.totalPages;
          state.pagination.hasPrev = state.pagination.page > 1;
        }

        // Извлекаем уникальные категории
        const categories = new Set<string>();
        state.items.forEach((block: ReusableBlock) => {
          if (block.category) {
            categories.add(block.category);
          }
        });
        state.categories = Array.from(categories).sort();
      })
      .addCase(fetchReusableBlocks.rejected, (state, action) => {
        state.loading.fetch = false;
        state.errors.fetch = action.error.message || 'Failed to fetch reusable blocks';
      })

      // Instantiate reusable block
      .addCase(instantiateReusableBlock.pending, (state) => {
        state.loading.instantiate = true;
        state.errors.instantiate = undefined;
      })
      .addCase(instantiateReusableBlock.fulfilled, (state, action) => {
        state.loading.instantiate = false;
        // Увеличиваем счетчик использования для созданного блока
        if (action.meta.arg?.reusableBlockId) {
          const block = state.items.find(item => item.id === action.meta.arg.reusableBlockId);
          if (block) {
            block.usage_count += 1;
          }
        }
        // Возвращаем дерево блоков, которое будет обработано в компоненте
        return action.payload;
      })
      .addCase(instantiateReusableBlock.rejected, (state, action) => {
        state.loading.instantiate = false;
        state.errors.instantiate = action.error.message || 'Failed to instantiate reusable block';
      });
  },
});

// Экспортируем actions
export const {
  setLibraryOpen,
  setFilters,
  clearFilters,
  setPage,
  clearErrors,
  incrementUsageCount,
} = reusableBlocksSlice.actions;

// Экспортируем reducer
export default reusableBlocksSlice.reducer;
