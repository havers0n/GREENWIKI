import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchReusableBlocks,
  setLibraryOpen,
  setFilters,
  clearFilters,
  setPage,
} from '../../../store/slices/reusableBlocksSlice';
import { useNotificationActions } from '../../../shared/contexts/NotificationContext';
import type {
  UseLibraryLogicResult,
  ReusableBlocksLibraryProps
} from '../types';

/**
 * Основной хук для логики ReusableBlocksLibrary
 * Содержит всю бизнес-логику управления библиотекой
 */
export const useLibraryLogic = (
  isOpen: boolean,
  onClose: () => void
): UseLibraryLogicResult => {
  const dispatch = useAppDispatch();
  const { error: showError } = useNotificationActions();

  // Получаем состояние из Redux
  const {
    items,
    categories,
    loading,
    filters,
    pagination,
    errors,
  } = useAppSelector(state => state.reusableBlocks);

  // Загружаем блоки при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchReusableBlocks({
        search: filters.search,
        category: filters.category,
        page: pagination.page,
        limit: pagination.limit,
      }));
    }
  }, [isOpen, dispatch, filters.search, filters.category, pagination.page, pagination.limit]);

  // Обработчик применения поиска
  const handleSearchSubmit = () => {
    // Поиск обрабатывается через локальное состояние в useLibraryFilters
    // Здесь мы можем добавить дополнительную логику валидации
  };

  // Обработчик изменения категории
  const handleCategoryChange = (category: string) => {
    dispatch(setFilters({ category: category || undefined }));
  };

  // Обработчик очистки фильтров
  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  // Обработчик изменения страницы
  const handlePageChange = (page: number) => {
    dispatch(setPage(page));
  };

  // Закрытие модального окна
  const handleClose = () => {
    dispatch(setLibraryOpen(false));
    onClose();
  };

  // Обработчик повторной попытки загрузки при ошибке
  const handleRetryLoad = () => {
    dispatch(fetchReusableBlocks());
    showError('Ошибка загрузки', 'Повторная попытка загрузки блоков...');
  };

  return {
    // Состояние
    items,
    categories,
    loading,
    filters,
    pagination,
    errors,

    // Действия
    handleSearchSubmit,
    handleCategoryChange,
    handleClearFilters,
    handlePageChange,
    handleClose,
    handleRetryLoad,
  };
};
