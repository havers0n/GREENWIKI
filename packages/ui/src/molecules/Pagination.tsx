import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '../atoms/Button';
import { cn } from '../lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
  className?: string;
  disabled?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPageNumbers = true,
  maxVisiblePages = 5,
  className,
  disabled = false,
}) => {
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const showStartEllipsis = visiblePages[0] > 2;
  const showEndEllipsis = visiblePages[visiblePages.length - 1] < totalPages - 1;

  if (totalPages <= 1) return null;

  return (
    <nav
      className={cn('flex items-center justify-between', className)}
      aria-label="Пагинация"
    >
      <div className="flex items-center space-x-1">
        {/* Кнопка "Первая" */}
        {showFirstLast && currentPage > 2 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={disabled}
            className="px-2"
          >
            Первая
          </Button>
        )}

        {/* Кнопка "Предыдущая" */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          className="p-2"
        >
          {React.createElement(ChevronLeft as any, { className: "h-4 w-4" })}
          <span className="sr-only">Предыдущая страница</span>
        </Button>

        {/* Номера страниц */}
        {showPageNumbers && (
          <div className="flex items-center space-x-1">
            {/* Эллипсис в начале */}
            {showStartEllipsis && (
              <>
                <Button
                  variant={currentPage === 1 ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onPageChange(1)}
                  disabled={disabled}
                  className="px-3"
                >
                  1
                </Button>
                <span className="px-2 text-gray-500">
                  {React.createElement(MoreHorizontal as any, { className: "h-4 w-4" })}
                </span>
              </>
            )}

            {/* Видимые страницы */}
            {visiblePages.map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(page)}
                disabled={disabled}
                className="px-3"
              >
                {page}
              </Button>
            ))}

            {/* Эллипсис в конце */}
            {showEndEllipsis && (
              <>
                <span className="px-2 text-gray-500">
                  {React.createElement(MoreHorizontal as any, { className: "h-4 w-4" })}
                </span>
                <Button
                  variant={currentPage === totalPages ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onPageChange(totalPages)}
                  disabled={disabled}
                  className="px-3"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>
        )}

        {/* Кнопка "Следующая" */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          className="p-2"
        >
          {React.createElement(ChevronRight as any, { className: "h-4 w-4" })}
          <span className="sr-only">Следующая страница</span>
        </Button>

        {/* Кнопка "Последняя" */}
        {showFirstLast && currentPage < totalPages - 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={disabled}
            className="px-2"
          >
            Последняя
          </Button>
        )}
      </div>

      {/* Информация о текущей странице */}
      <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        <span>Страница</span>
        <span className="font-medium">{currentPage}</span>
        <span>из</span>
        <span className="font-medium">{totalPages}</span>
      </div>
    </nav>
  );
};

// Простая версия пагинации для мобильных устройств
export const SimplePagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  disabled = false,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center justify-between', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || currentPage === 1}
        className="flex items-center space-x-1"
      >
        {React.createElement(ChevronLeft as any, { className: "h-4 w-4" })}
        <span>Предыдущая</span>
      </Button>

      <span className="text-sm text-gray-600 dark:text-gray-400">
        {currentPage} из {totalPages}
      </span>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
        className="flex items-center space-x-1"
      >
        <span>Следующая</span>
        {React.createElement(ChevronRight as any, { className: "h-4 w-4" })}
      </Button>
    </div>
  );
};
