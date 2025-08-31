import React from 'react';
import { Typography } from '@my-forum/ui';
import type { BaseLibraryProps } from '../types';

/**
 * Заголовок библиотеки переиспользуемых блоков
 * Отвечает за отображение заголовка модального окна
 */
const LibraryHeader: React.FC<BaseLibraryProps> = ({
  className
}) => {
  return (
    <div className={className}>
      <Typography as="h2" variant="h2" className="text-lg">
        Библиотека переиспользуемых блоков
      </Typography>
    </div>
  );
};

LibraryHeader.displayName = 'LibraryHeader';

export { LibraryHeader };
export default LibraryHeader;
