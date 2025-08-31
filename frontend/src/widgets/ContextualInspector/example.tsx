import React, { useState } from 'react';
import { ContextualInspector } from './indexNew';
import type { LayoutBlock } from './types';

/**
 * Примеры использования нового ContextualInspector
 */

// Пример с полным функционалом
export const FullInspectorExample: React.FC = () => {
  const [selectedBlock, setSelectedBlock] = useState<LayoutBlock | null>(null);
  const [isOpen, setIsOpen] = useState(false);



  const handleBlockChange = (updatedBlock: LayoutBlock) => {
    console.log('Block updated:', updatedBlock);
    setSelectedBlock(updatedBlock);
  };

  const handleOpenInspector = () => {
    setIsOpen(true);
  };

  return (
    <div className="p-4">
      <button
        onClick={handleOpenInspector}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Открыть инспектор
      </button>

      <ContextualInspector
        block={selectedBlock}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onBlockChange={handleBlockChange}
        onPublishToggle={async (blockId) => {
          console.log('Publishing block:', blockId);
        }}
        onBlockDelete={(blockId) => {
          console.log('Deleting block:', blockId);
        }}
        allBlocks={[]}
        onMoveLeft={(blockId) => {
          console.log('Moving left:', blockId);
        }}
        onMoveRight={(blockId) => {
          console.log('Moving right:', blockId);
        }}
        blockId="block-123"
      />
    </div>
  );
};

// Пример использования отдельных компонентов
export const IndividualComponentsExample: React.FC = () => {

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h2 className="text-lg font-semibold">Отдельные компоненты инспектора</h2>

      {/* Только заголовок */}
      <div className="border rounded p-4">
        <h3 className="font-medium mb-2">InspectorHeader:</h3>
        {/* <InspectorHeader block={mockBlock} onClose={() => {}} /> */}
      </div>

      {/* Только информация о блоке */}
      <div className="border rounded p-4">
        <h3 className="font-medium mb-2">BlockInfo:</h3>
        {/* <BlockInfo block={mockBlock} statusInfo={{ text: 'Опубликован', color: 'text-green-600', icon: '✓' }} /> */}
      </div>

      {/* Только навигация */}
      <div className="border rounded p-4">
        <h3 className="font-medium mb-2">BlockNavigation:</h3>
        {/* <BlockNavigation block={mockBlock} allBlocks={[mockBlock]} /> */}
      </div>
    </div>
  );
};

// Пример использования хуков отдельно
export const HooksExample: React.FC = () => {
  // const { spec, isInstance, statusInfo } = useInspectorLogic(mockBlock);
  // const { canMoveLeft, canMoveRight } = useBlockNavigation(mockBlock, [mockBlock]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Пример использования хуков</h2>

      <div className="space-y-2 text-sm">
        {/* <div>Spec найден: {spec ? 'Да' : 'Нет'}</div> */}
        {/* <div>Является экземпляром: {isInstance ? 'Да' : 'Нет'}</div> */}
        {/* <div>Статус: {statusInfo.icon} {statusInfo.text}</div> */}
        {/* <div>Можно двигать влево: {canMoveLeft() ? 'Да' : 'Нет'}</div> */}
        {/* <div>Можно двигать вправо: {canMoveRight() ? 'Да' : 'Нет'}</div> */}
      </div>
    </div>
  );
};

export const ContextualInspectorExamples = {
  FullInspectorExample,
  IndividualComponentsExample,
  HooksExample
};
