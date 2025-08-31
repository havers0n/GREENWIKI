import React from 'react';
import { SearchInput, Button } from '@my-forum/ui';
import type { LibrarySearchProps } from '../types';

/**
 * Компонент поиска в библиотеке блоков
 * Отвечает за поисковую строку и кнопку поиска
 */
const LibrarySearch: React.FC<LibrarySearchProps> = ({
  searchValue,
  onSearchChange,
  onSearchSubmit,
  loading = false
}) => {
  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <SearchInput
          placeholder="Поиск по названию или описанию..."
          value={searchValue}
          onChange={onSearchChange}
        />
      </div>
      <Button
        onClick={onSearchSubmit}
        disabled={loading}
        size="sm"
      >
        Поиск
      </Button>
    </div>
  );
};

LibrarySearch.displayName = 'LibrarySearch';

export { LibrarySearch };
export default LibrarySearch;
