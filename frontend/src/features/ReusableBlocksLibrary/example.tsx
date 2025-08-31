import React, { useState } from 'react';
import { ReusableBlocksLibrary } from './indexNew';


/**
 * Примеры использования нового ReusableBlocksLibrary
 */

// Пример с полным функционалом
export const FullLibraryExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-4">
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Открыть библиотеку блоков
      </button>

      <ReusableBlocksLibrary
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
};

// Пример использования отдельных компонентов
export const IndividualComponentsExample: React.FC = () => {






  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-lg font-semibold">Отдельные компоненты библиотеки</h2>

      {/* Только заголовок */}
      <div className="border rounded p-4">
        <h3 className="font-medium mb-2">LibraryHeader:</h3>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          {/* <LibraryHeader /> */}
          <h2 className="text-lg">Библиотека переиспользуемых блоков</h2>
        </div>
      </div>

      {/* Только поиск */}
      <div className="border rounded p-4">
        <h3 className="font-medium mb-2">LibrarySearch:</h3>
        {/* <LibrarySearch
          searchValue={searchValue}
          onSearchChange={(e) => setSearchValue(e.target.value)}
          onSearchSubmit={() => console.log('Search:', searchValue)}
        /> */}
      </div>

      {/* Только фильтры */}
      <div className="border rounded p-4">
        <h3 className="font-medium mb-2">LibraryFilters:</h3>
        {/* <LibraryFilters
          categories={mockCategories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onClearFilters={() => {
            setSearchValue('');
            setSelectedCategory('');
          }}
        /> */}
      </div>

      {/* Только сетка */}
      <div className="border rounded p-4">
        <h3 className="font-medium mb-2">LibraryGrid:</h3>
        {/* <LibraryGrid
          blocks={mockBlocks}
          virtualized={false}
        /> */}
      </div>
    </div>
  );
};

// Пример использования хуков отдельно
export const HooksExample: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  // const {
  //   items,
  //   categories,
  //   loading,
  //   filters,
  //   pagination,
  //   errors,
  // } = useLibraryLogic(isOpen, () => setIsOpen(false));

  // const {
  //   searchValue,
  //   setSearchValue,
  //   categoryValue,
  //   setCategoryValue,
  // } = useLibraryFilters(filters.search || '', filters.category || '');

  // const { gridConfig, shouldVirtualize } = useLibraryVirtualization(items);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Пример использования хуков</h2>

      <div className="space-y-2 text-sm">
        <div>Статус модального окна: {isOpen ? 'Открыт' : 'Закрыт'}</div>
        {/* <div>Количество блоков: {items.length}</div> */}
        {/* <div>Категории: {categories.join(', ')}</div> */}
        {/* <div>Загрузка: {loading.fetch ? 'Да' : 'Нет'}</div> */}
        {/* <div>Виртуализация: {shouldVirtualize ? 'Включена' : 'Выключена'}</div> */}
        {/* <div>Текущая страница: {pagination.page} из {pagination.totalPages}</div> */}
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
      >
        {isOpen ? 'Закрыть' : 'Открыть'} модальное окно
      </button>
    </div>
  );
};

export const ReusableBlocksLibraryExamples = {
  FullLibraryExample,
  IndividualComponentsExample,
  HooksExample
};
