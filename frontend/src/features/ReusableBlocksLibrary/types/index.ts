// Типы для ReusableBlocksLibrary

// Типы из Redux store
export interface ReusableBlock {
  id: string;
  name: string;
  description?: string;
  category?: string;
  content: any;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface LibraryFilters {
  search?: string;
  category?: string;
}

export interface LibraryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface LibraryLoading {
  fetch: boolean;
  search?: boolean;
}

export interface LibraryErrors {
  fetch?: string;
  search?: string;
}

// Базовые props для всех компонентов библиотеки
export interface BaseLibraryProps {
  className?: string;
}

// Props для основного компонента
export interface ReusableBlocksLibraryProps extends BaseLibraryProps {
  isOpen: boolean;
  onClose: () => void;
}

// Props для компонентов поиска
export interface LibrarySearchProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  loading?: boolean;
}

// Props для компонентов фильтров
export interface LibraryFiltersProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onClearFilters: () => void;
}

// Props для компонентов сетки
export interface LibraryGridProps {
  blocks: ReusableBlock[];
  loading?: boolean;
  virtualized?: boolean;
  gridConfig?: GridConfig | null;
}

// Props для пагинации
export interface LibraryPaginationProps {
  pagination: LibraryPagination;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

// Props для пустых состояний
export interface LibraryEmptyStateProps {
  hasFilters: boolean;
  searchQuery: string;
  onClearSearch: () => void;
}

// Типы для виртуализации
export interface GridConfig {
  columnCount: number;
  rowCount: number;
  width: number;
  height: number;
}

export interface VirtualizationConfig {
  threshold: number;
  cardWidth: number;
  cardHeight: number;
  columnGap: number;
  rowGap: number;
  containerWidth: number;
  maxHeight: number;
}

// Типы для хуков
export interface UseLibraryLogicResult {
  // Состояние
  items: ReusableBlock[];
  categories: string[];
  loading: LibraryLoading;
  filters: LibraryFilters;
  pagination: LibraryPagination;
  errors: LibraryErrors;

  // Действия
  handleSearchSubmit: () => void;
  handleCategoryChange: (category: string) => void;
  handleClearFilters: () => void;
  handlePageChange: (page: number) => void;
  handleClose: () => void;
}

export interface UseLibraryFiltersResult {
  searchValue: string;
  setSearchValue: (value: string) => void;
  categoryValue: string;
  setCategoryValue: (value: string) => void;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export interface UseLibraryVirtualizationResult {
  gridConfig: GridConfig | null;
  shouldVirtualize: boolean;
  virtualizationConfig: VirtualizationConfig;
}

// Utility types
export type LibraryState = 'loading' | 'error' | 'empty' | 'has-data';
export type FilterType = 'search' | 'category';
export type ViewMode = 'grid' | 'list';
