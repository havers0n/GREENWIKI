import React from 'react';
import { Modal } from '../../../shared/ui/molecules/Modal';
import { Spinner } from '../../../shared/ui/atoms/Spinner';
import { Button } from '../../../shared/ui/atoms/Button';
import { LibraryHeader } from './LibraryHeader';
import { LibrarySearch } from './LibrarySearch';
import { LibraryFilters } from './LibraryFilters';
import { LibraryGrid } from './LibraryGrid';
import { LibraryPagination } from './LibraryPagination';
import { LibraryEmptyState } from './LibraryEmptyState';
import { useLibraryLogic } from '../model/useLibraryLogic';
import { useLibraryFilters } from '../model/useLibraryFilters';
import { useLibraryVirtualization } from '../model/useLibraryVirtualization';
import type { ReusableBlocksLibraryProps } from '../types';

/**
 * Новый рефакторированный ReusableBlocksLibrary
 * Разделен на мелкие компоненты с четкими ответственностями
 */
const ReusableBlocksLibraryNew: React.FC<ReusableBlocksLibraryProps> = ({
  isOpen,
  onClose,
  className
}) => {
  // Основная бизнес-логика
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
    handleClose,
    handleRetryLoad,
  } = useLibraryLogic(isOpen, onClose);

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
    <Modal
      title={<LibraryHeader />}
      isOpen={isOpen}
      onClose={handleClose}
      className={`max-w-4xl ${className || ''}`}
    >
      <div className="space-y-6">
        {/* Панель поиска и фильтров */}
        <div className="space-y-4">
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
        <div className="min-h-96">
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
    </Modal>
  );
};

ReusableBlocksLibraryNew.displayName = 'ReusableBlocksLibraryNew';

export { ReusableBlocksLibraryNew };
export default ReusableBlocksLibraryNew;
