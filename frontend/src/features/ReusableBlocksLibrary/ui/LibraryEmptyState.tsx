import React from 'react';
import { Button } from '../../../shared/ui/atoms/Button';
import { EmptyBlocksLibrary, EmptySearchResults } from '../../../shared/ui/organisms/EmptyState';
import type { LibraryEmptyStateProps } from '../types';

/**
 * Компонент пустых состояний для библиотеки блоков
 * Отвечает за отображение различных пустых состояний
 */
const LibraryEmptyState: React.FC<LibraryEmptyStateProps> = ({
  hasFilters,
  searchQuery,
  onClearSearch
}) => {
  if (hasFilters) {
    return (
      <EmptySearchResults
        searchQuery={searchQuery}
        onClearSearch={onClearSearch}
      />
    );
  }

  return <EmptyBlocksLibrary />;
};

LibraryEmptyState.displayName = 'LibraryEmptyState';

export { LibraryEmptyState };
export default LibraryEmptyState;
