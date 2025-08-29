// Новый рефакторированный ReusableBlocksLibrary
// Экспорты всех компонентов и хуков

// Основной компонент
export { ReusableBlocksLibraryNew as ReusableBlocksLibrary } from './ui/ReusableBlocksLibraryNew';

// UI компоненты
export { LibraryHeader } from './ui/LibraryHeader';
export { LibrarySearch } from './ui/LibrarySearch';
export { LibraryFilters } from './ui/LibraryFilters';
export { LibraryGrid } from './ui/LibraryGrid';
export { LibraryPagination } from './ui/LibraryPagination';
export { LibraryEmptyState } from './ui/LibraryEmptyState';

// Хуки
export { useLibraryLogic } from './model/useLibraryLogic';
export { useLibraryFilters } from './model/useLibraryFilters';
export { useLibraryVirtualization } from './model/useLibraryVirtualization';

// Типы
export type {
  ReusableBlocksLibraryProps,
  LibrarySearchProps,
  LibraryFiltersProps,
  LibraryGridProps,
  LibraryPaginationProps,
  LibraryEmptyStateProps,
  ReusableBlock,
  LibraryFilters as Filters,
  LibraryPagination as Pagination,
  LibraryLoading,
  LibraryErrors,
  UseLibraryLogicResult,
  UseLibraryFiltersResult,
  UseLibraryVirtualizationResult,
  GridConfig,
  VirtualizationConfig,
} from './types';

// Переэкспорт для обратной совместимости
export { ReusableBlocksLibraryNew as default } from './ui/ReusableBlocksLibraryNew';
