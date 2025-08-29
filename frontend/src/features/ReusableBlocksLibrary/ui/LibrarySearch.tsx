import React from 'react';
import { SearchInput } from '../../../shared/ui/molecules/SearchInput';
import { Button } from '../../../shared/ui/atoms/Button';
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
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <SearchInput
          placeholder="Поиск по названию или описанию..."
          value={searchValue}
          onChange={onSearchChange}
          onKeyDown={handleKeyDown}
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
