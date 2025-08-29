import { useState } from 'react';
import { useAppDispatch } from '../../../store/hooks';
import { setFilters } from '../../../store/slices/reusableBlocksSlice';
import type { UseLibraryFiltersResult } from '../types';

/**
 * Хук для управления фильтрами библиотеки
 * Обрабатывает локальное состояние формы и синхронизацию с Redux
 */
export const useLibraryFilters = (
  initialSearch = '',
  initialCategory = ''
): UseLibraryFiltersResult => {
  const dispatch = useAppDispatch();

  // Локальное состояние для формы поиска
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [categoryValue, setCategoryValue] = useState(initialCategory);

  // Обработчик изменения поиска
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Обработчик изменения категории
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setCategoryValue(category);

    // Синхронизируем с Redux
    dispatch(setFilters({
      category: category || undefined
    }));
  };

  // Обработчик применения поиска
  const handleSearchSubmit = () => {
    dispatch(setFilters({
      search: searchValue.trim() || undefined,
    }));
  };

  return {
    searchValue,
    setSearchValue,
    categoryValue,
    setCategoryValue,
    handleSearchChange,
    handleCategoryChange,
    handleSearchSubmit,
  };
};
