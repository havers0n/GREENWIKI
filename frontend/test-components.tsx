// Тестовый файл для проверки компонентов
import React from 'react';
import { ButtonBlock } from './src/blocks/atomic/ButtonBlock';
import { ColumnsBlock } from './src/blocks/layout/ColumnsBlock';

const TestComponents: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Тест компонентов</h1>

      {/* Тест ButtonBlock */}
      <div>
        <h2 className="text-xl font-semibold mb-4">ButtonBlock</h2>
        <ButtonBlock
          text="Тестовая кнопка"
          variant="primary"
          size="md"
          link="#"
        />
      </div>

      {/* Тест ColumnsBlock */}
      <div>
        <h2 className="text-xl font-semibold mb-4">ColumnsBlock</h2>
        <ColumnsBlock
          layout="three"
          gap="medium"
          className="border rounded p-4"
        >
          <div className="bg-blue-100 p-4 rounded">Колонка 1</div>
          <div className="bg-green-100 p-4 rounded">Колонка 2</div>
          <div className="bg-yellow-100 p-4 rounded">Колонка 3</div>
        </ColumnsBlock>
      </div>
    </div>
  );
};

export default TestComponents;
