import React from 'react';
import { Spinner, Button } from '@my-forum/ui';
import { LibraryHeader } from '../../../features/ReusableBlocksLibrary/ui/LibraryHeader';
import { LibrarySearch } from '../../../features/ReusableBlocksLibrary/ui/LibrarySearch';
import { LibraryFilters } from '../../../features/ReusableBlocksLibrary/ui/LibraryFilters';
import { LibraryGrid } from '../../../features/ReusableBlocksLibrary/ui/LibraryGrid';
import { LibraryPagination } from '../../../features/ReusableBlocksLibrary/ui/LibraryPagination';
import { LibraryEmptyState } from '../../../features/ReusableBlocksLibrary/ui/LibraryEmptyState';
import { useLibraryLogic } from '../../../features/ReusableBlocksLibrary/model/useLibraryLogic';
import { useLibraryFilters } from '../../../features/ReusableBlocksLibrary/model/useLibraryFilters';
import { useLibraryVirtualization } from '../../../features/ReusableBlocksLibrary/model/useLibraryVirtualization';

interface ReusableBlocksLibrarySidebarProps {
  className?: string;
}

/**
 * ReusableBlocksLibrarySidebar - адаптированная версия ReusableBlocksLibrary для UnifiedSidebar
 * Убрана Modal обертка, добавлена поддержка внутреннего скролла
 */
const ReusableBlocksLibrarySidebar: React.FC<ReusableBlocksLibrarySidebarProps> = ({
  className
}) => {
  // Основная бизнес-логика (isOpen всегда true для сайдбара, onClose не используется)
  const {
    items,
    categories,
    loading,
    filters,
    pagination,
    errors,
    handleCategoryChange,
    handleClearFilters,
    handlePageChange,
    handleRetryLoad,
  } = useLibraryLogic(true, () => {}); // isOpen=true, onClose пустая функция

  // Логика фильтров
  const {
    searchValue,
    setSearchValue,
    categoryValue,
    setCategoryValue,
    handleSearchChange,
    handleSearchSubmit,
  } = useLibraryFilters(filters.search || '', filters.category || '');

  // Логика виртуализации
  const { gridConfig, shouldVirtualize } = useLibraryVirtualization(items);

  // Обработчик очистки фильтров
  const handleClearAllFilters = () => {
    setSearchValue('');
    setCategoryValue('');
    handleClearFilters();
  };

  // Определяем состояние библиотеки
  const hasFilters = Boolean(filters.search || filters.category);
  const hasData = items.length > 0;
  const hasError = Boolean(errors.fetch);

  return (
    <div className={`h-full flex flex-col ${className || ''}`}>
      {/* Заголовок */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <LibraryHeader />
      </div>

      {/* Панель поиска и фильтров */}
      <div className="p-4 space-y-4 border-b border-gray-200 dark:border-gray-700">
        {/* Поиск */}
        <LibrarySearch
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          loading={loading.fetch}
        />

        {/* Фильтры */}
        <LibraryFilters
          categories={categories}
          selectedCategory={categoryValue}
          onCategoryChange={(category) => {
            setCategoryValue(category);
            handleCategoryChange(category);
          }}
          onClearFilters={handleClearAllFilters}
        />
      </div>

      {/* Содержимое библиотеки */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading.fetch && !hasData ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              Загрузка блоков...
            </span>
          </div>
        ) : hasError ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400 mb-2">
                Ошибка загрузки блоков
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {errors.fetch}
              </p>
              <Button
                onClick={handleRetryLoad}
                size="sm"
              >
                Попробовать снова
              </Button>
            </div>
          </div>
        ) : !hasData ? (
          <LibraryEmptyState
            hasFilters={hasFilters}
            searchQuery={filters.search || filters.category || ''}
            onClearSearch={handleClearAllFilters}
          />
        ) : (
          <>
            {/* Сетка блоков */}
            <LibraryGrid
              blocks={items}
              loading={loading.fetch}
              virtualized={shouldVirtualize}
              gridConfig={gridConfig}
            />

            {/* Пагинация */}
            <LibraryPagination
              pagination={pagination}
              onPageChange={handlePageChange}
              loading={loading.fetch}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ReusableBlocksLibrarySidebar;
