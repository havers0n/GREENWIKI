import React from 'react';
import { Select, Typography } from '@my-forum/ui';
import type { ColumnsEditorProps, ColumnsLayout } from '../types';

/**
 * ColumnsBlockEditor - редактор для настройки блока колонок
 * Позволяет выбирать количество колонок
 */
const ColumnsBlockEditor: React.FC<ColumnsEditorProps> = ({ data, onChange }) => {
  const handleLayoutChange = (layout: ColumnsLayout) => {
    onChange({
      ...data,
      layout,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Typography variant="h4" className="mb-2">
          Настройки колонок
        </Typography>
        <Typography variant="body" className="text-gray-600 dark:text-gray-400">
          Выберите количество колонок для вашего макета
        </Typography>
      </div>

      <div className="space-y-3">
        <Select
          label="Количество колонок"
          value={data.layout}
          onChange={(e) => handleLayoutChange(e.target.value as ColumnsLayout)}
        >
          <option value="two">2 колонки</option>
          <option value="three">3 колонки</option>
          <option value="four">4 колонки</option>
        </Select>

        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Typography variant="body" className="text-gray-700 dark:text-gray-300">
            <strong>Совет:</strong> Перетащите блоки из библиотеки в каждую колонку для создания содержимого.
            Колонки автоматически адаптируются под размер содержимого.
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default ColumnsBlockEditor;
