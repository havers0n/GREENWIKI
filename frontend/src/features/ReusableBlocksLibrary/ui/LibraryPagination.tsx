import React from 'react';
import { Button } from '../../../shared/ui/atoms/Button';
import type { LibraryPaginationProps } from '../types';

/**
 * Компонент пагинации для библиотеки блоков
 * Отвечает за навигацию между страницами
 */
const LibraryPagination: React.FC<LibraryPaginationProps> = ({
  pagination,
  onPageChange,
  loading = false
}) => {
  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Показано {pagination.total > 0 ? pagination.total : 0} блоков
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={!pagination.hasPrev || loading}
          size="sm"
          variant="secondary"
        >
          Предыдущая
        </Button>
        <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
          {pagination.page} из {pagination.totalPages}
        </span>
        <Button
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={!pagination.hasNext || loading}
          size="sm"
          variant="secondary"
        >
          Следующая
        </Button>
      </div>
    </div>
  );
};

LibraryPagination.displayName = 'LibraryPagination';

export { LibraryPagination };
export default LibraryPagination;
