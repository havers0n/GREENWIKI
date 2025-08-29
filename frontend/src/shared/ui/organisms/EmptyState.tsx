import React from 'react';
import { Button } from '../atoms/Button';
import { cn } from '../../lib/utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  className?: string;
}

/**
 * Компонент для отображения пустых состояний
 * Используется когда нет данных для отображения
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-6 text-center',
      className
    )}>
      {icon && (
        <div className="mb-4 text-gray-400">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md">
          {description}
        </p>
      )}

      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || 'primary'}
          size="sm"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

/**
 * Специализированный компонент для пустой библиотеки блоков
 */
export const EmptyBlocksLibrary: React.FC<{
  onCreateBlock?: () => void;
  className?: string;
}> = ({ onCreateBlock, className }) => {
  return (
    <EmptyState
      icon={
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      }
      title="Переиспользуемые блоки не найдены"
      description="У вас пока нет переиспользуемых блоков. Создайте свой первый блок, чтобы начать использовать систему повторного использования контента."
      action={onCreateBlock ? {
        label: "Создать первый блок",
        onClick: onCreateBlock,
        variant: "primary"
      } : undefined}
      className={className}
    />
  );
};

/**
 * Специализированный компонент для пустой страницы
 */
export const EmptyPage: React.FC<{
  onAddBlock?: () => void;
  className?: string;
}> = ({ onAddBlock, className }) => {
  return (
    <EmptyState
      icon={
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      }
      title="Страница пуста"
      description="На этой странице пока нет блоков. Начните создавать контент, добавив первый блок из библиотеки или создав новый."
      action={onAddBlock ? {
        label: "Добавить первый блок",
        onClick: onAddBlock,
        variant: "primary"
      } : undefined}
      className={className}
    />
  );
};

/**
 * Специализированный компонент для пустых результатов поиска
 */
export const EmptySearchResults: React.FC<{
  searchQuery: string;
  onClearSearch?: () => void;
  className?: string;
}> = ({ searchQuery, onClearSearch, className }) => {
  return (
    <EmptyState
      icon={
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      title="Ничего не найдено"
      description={`По запросу "${searchQuery}" ничего не найдено. Попробуйте изменить критерии поиска или создать новый элемент.`}
      action={onClearSearch ? {
        label: "Очистить поиск",
        onClick: onClearSearch,
        variant: "secondary"
      } : undefined}
      className={className}
    />
  );
};
