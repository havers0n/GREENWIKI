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

  // Мокаем блок для демонстрации
  const mockBlock: LayoutBlock = {
    id: 'block-123',
    block_type: 'container_section',
    content: { title: 'Тестовый блок' },
    metadata: { spacing: { marginTop: '10px' } },
    position: 1,
    status: 'draft',
    page_id: 1,
    parent_block_id: null
  };

  const handleBlockChange = (updatedBlock: LayoutBlock) => {
    console.log('Block updated:', updatedBlock);
    setSelectedBlock(updatedBlock);
  };

  const handleOpenInspector = () => {
    setSelectedBlock(mockBlock);
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
        allBlocks={[mockBlock]}
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
  const mockBlock: LayoutBlock = {
    id: 'block-456',
    block_type: 'heading',
    content: { text: 'Заголовок', level: 1 },
    position: 2,
    status: 'published',
    page_id: 1,
    parent_block_id: null
  };

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
  const mockBlock: LayoutBlock = {
    id: 'block-789',
    block_type: 'paragraph',
    content: { text: 'Текст параграфа' },
    position: 3,
    status: 'draft',
    page_id: 1,
    parent_block_id: null
  };

  // const { spec, isInstance, statusInfo } = useInspectorLogic(mockBlock);
  // const { canMoveLeft, canMoveRight } = useBlockNavigation(mockBlock, [mockBlock]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Пример использования хуков</h2>

      <div className="space-y-2 text-sm">
        <div>Тип блока: {mockBlock.block_type}</div>
        <div>Позиция: #{mockBlock.position}</div>
        <div>Статус: {mockBlock.status}</div>
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
