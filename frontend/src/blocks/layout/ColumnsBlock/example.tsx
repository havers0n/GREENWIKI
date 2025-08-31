import React from 'react';
import { ColumnsBlock } from './index';

/**
 * Пример использования ColumnsBlock
 */
const ColumnsBlockExample: React.FC = () => {
  return (
    <div className="p-4 space-y-8">
      <h2 className="text-2xl font-bold">Примеры использования ColumnsBlock</h2>

      {/* Пример с 2 колонками */}
      <div>
        <h3 className="text-lg font-semibold mb-2">2 колонки</h3>
        <ColumnsBlock layout="two" gap="medium" className="border rounded p-4">
          <div className="bg-blue-100 p-4 rounded">Колонка 1</div>
          <div className="bg-green-100 p-4 rounded">Колонка 2</div>
        </ColumnsBlock>
      </div>

      {/* Пример с 3 колонками */}
      <div>
        <h3 className="text-lg font-semibold mb-2">3 колонки</h3>
        <ColumnsBlock layout="three" gap="medium" className="border rounded p-4">
          <div className="bg-red-100 p-4 rounded">Колонка 1</div>
          <div className="bg-yellow-100 p-4 rounded">Колонка 2</div>
          <div className="bg-purple-100 p-4 rounded">Колонка 3</div>
        </ColumnsBlock>
      </div>

      {/* Пример с 4 колонками */}
      <div>
        <h3 className="text-lg font-semibold mb-2">4 колонки</h3>
        <ColumnsBlock layout="four" gap="small" className="border rounded p-4">
          <div className="bg-pink-100 p-4 rounded">Колонка 1</div>
          <div className="bg-indigo-100 p-4 rounded">Колонка 2</div>
          <div className="bg-teal-100 p-4 rounded">Колонка 3</div>
          <div className="bg-orange-100 p-4 rounded">Колонка 4</div>
        </ColumnsBlock>
      </div>

      {/* Пример с разными отступами */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Разные отступы</h3>
        <div className="space-y-4">
          <ColumnsBlock layout="three" gap="none" className="border rounded p-4">
            <div className="bg-gray-100 p-4 rounded">Без отступов</div>
            <div className="bg-gray-200 p-4 rounded">Без отступов</div>
            <div className="bg-gray-300 p-4 rounded">Без отступов</div>
          </ColumnsBlock>

          <ColumnsBlock layout="three" gap="large" className="border rounded p-4">
            <div className="bg-gray-100 p-4 rounded">Большие отступы</div>
            <div className="bg-gray-200 p-4 rounded">Большие отступы</div>
            <div className="bg-gray-300 p-4 rounded">Большие отступы</div>
          </ColumnsBlock>
        </div>
      </div>
    </div>
  );
};

export default ColumnsBlockExample;
