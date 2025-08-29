import React from 'react';
import { Select } from '../../../shared/ui/atoms/Select';
import { Button } from '../../../shared/ui/atoms/Button';
import type { LibraryFiltersProps } from '../types';

/**
 * Компонент фильтров библиотеки блоков
 * Отвечает за фильтрацию по категориям и очистку фильтров
 */
const LibraryFilters: React.FC<LibraryFiltersProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  onClearFilters
}) => {
  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-48">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Категория
        </label>
        <Select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full"
        >
          <option value="">Все категории</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </div>

      <Button
        onClick={onClearFilters}
        variant="secondary"
        size="sm"
      >
        Очистить
      </Button>
    </div>
  );
};

LibraryFilters.displayName = 'LibraryFilters';

export { LibraryFilters };
export default LibraryFilters;
