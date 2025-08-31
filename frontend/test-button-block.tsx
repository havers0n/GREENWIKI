// Тестовый файл для проверки ButtonBlock
import React from 'react';
import { ButtonBlock } from './src/blocks/atomic/ButtonBlock';

const TestButtonBlock: React.FC = () => {
  return (
    <div>
      <h1>Тест ButtonBlock</h1>
      <ButtonBlock
        text="Тестовая кнопка"
        variant="primary"
        size="md"
        link="#"
      />
    </div>
  );
};

export default TestButtonBlock;
