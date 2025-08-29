import React from 'react';
import { ContainerBlock, ContainerBlockEditor } from './index';

/**
 * Примеры использования нового ContainerBlock
 */

// Простой контейнер
export const SimpleContainerExample: React.FC = () => {
  return (
    <ContainerBlock
      layout="vertical"
      gap="medium"
      padding="large"
      backgroundColor="#f8fafc"
      borderRadius="8px"
    >
      <h3>Простой контейнер</h3>
      <p>Это содержимое контейнера</p>
      <button>Кнопка действия</button>
    </ContainerBlock>
  );
};

// Горизонтальный контейнер
export const HorizontalContainerExample: React.FC = () => {
  return (
    <ContainerBlock
      layout="horizontal"
      gap="large"
      padding="medium"
      maxWidth="800px"
    >
      <div>Первый элемент</div>
      <div>Второй элемент</div>
      <div>Третий элемент</div>
    </ContainerBlock>
  );
};

// Grid контейнер
export const GridContainerExample: React.FC = () => {
  return (
    <ContainerBlock
      layout="grid"
      gap="large"
      padding="large"
      title="Сетка карточек"
    >
      <div className="p-4 bg-white rounded shadow">Карточка 1</div>
      <div className="p-4 bg-white rounded shadow">Карточка 2</div>
      <div className="p-4 bg-white rounded shadow">Карточка 3</div>
      <div className="p-4 bg-white rounded shadow">Карточка 4</div>
    </ContainerBlock>
  );
};

// Контейнер в режиме редактора (для CMS)
export const EditorContainerExample: React.FC = () => {
  const [selectedBlockId, setSelectedBlockId] = React.useState<string | null>(null);

  return (
    <ContainerBlockEditor
      editorMode={true}
      blockId="container-123"
      allBlocks={[]} // Здесь будут дочерние блоки
      selectedBlockId={selectedBlockId}
      onSelectBlock={setSelectedBlockId}
      layout="vertical"
      gap="medium"
      padding="large"
      backgroundColor="#fefefe"
      borderRadius="8px"
      title="Редактируемый контейнер"
    >
      {/* Здесь будут дочерние блоки, рендер которых будет управляться через BlockRenderer */}
    </ContainerBlockEditor>
  );
};

// Пример миграции со старого ContainerSection
export const MigrationExample: React.FC = () => {
  // Старый способ (ContainerSection)
  // const oldContainer = (
  //   <ContainerSection
  //     layout="horizontal"
  //     gap="large"
  //     padding="medium"
  //     editorMode={true}
  //     blockId="container-123"
  //     allBlocks={blocks}
  //     selectedBlockId={selectedBlockId}
  //     onSelectBlock={onSelectBlock}
  //     onUpdateBlock={onUpdateBlock}
  //   />
  // );

  // Новый способ (ContainerBlockEditor)
  const newContainer = (
    <ContainerBlockEditor
      editorMode={true}
      blockId="container-123"
      allBlocks={[]} // Управляется через useContainerLogic
      selectedBlockId={null}
      onSelectBlock={() => {}}
      layout="horizontal"
      gap="large"
      padding="medium"
    >
      {/* Дочерние блоки рендерятся здесь */}
    </ContainerBlockEditor>
  );

  return newContainer;
};

export const ContainerExamples = {
  SimpleContainerExample,
  HorizontalContainerExample,
  GridContainerExample,
  EditorContainerExample,
  MigrationExample
};
