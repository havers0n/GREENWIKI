import React from 'react';
import { EmptyBlocksLibrary, EmptySearchResults } from '@my-forum/ui';
import type { LibraryEmptyStateProps } from '../types';

/**
 * Компонент пустых состояний для библиотеки блоков
 * Отвечает за отображение различных пустых состояний
 */
const LibraryEmptyState: React.FC<LibraryEmptyStateProps> = ({
  hasFilters,
  searchQuery: _searchQuery,
  onClearSearch: _onClearSearch
}) => {
  if (hasFilters) {
    return (
      <EmptySearchResults />
    );
  }

  return <EmptyBlocksLibrary />;
};

LibraryEmptyState.displayName = 'LibraryEmptyState';

export { LibraryEmptyState };
export default LibraryEmptyState;
