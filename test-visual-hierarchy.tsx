// Тестовый компонент для демонстрации визуальной иерархии
import React from 'react';
import { BlockWrapper } from './widgets/BlockRenderer/ui/BlockWrapper';

// Пример тестового дерева блоков
const mockBlocks = [
  {
    id: '1',
    block_type: 'section_block',
    content: { title: 'Главная секция' },
    depth: 0,
    children: [
      {
        id: '2',
        block_type: 'container_block',
        content: { title: 'Контейнер' },
        depth: 1,
        children: [
          {
            id: '3',
            block_type: 'button_block',
            content: { text: 'Кнопка' },
            depth: 2,
            children: []
          }
        ]
      },
      {
        id: '4',
        block_type: 'paragraph_block',
        content: { text: 'Параграф на первом уровне' },
        depth: 1,
        children: []
      }
    ]
  }
];

const TestBlock = ({ block }: { block: any }) => (
  <BlockWrapper depth={block.depth} className="border rounded p-2 mb-2 bg-white dark:bg-gray-800">
    <div className="font-medium text-sm">
      {block.block_type}: {block.content?.title || block.content?.text || 'Без названия'}
    </div>
    {block.children?.map((child: any) => (
      <TestBlock key={child.id} block={child} />
    ))}
  </BlockWrapper>
);

export const TestVisualHierarchy = () => (
  <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
    <h1 className="text-2xl font-bold mb-6">Тест визуальной иерархии блоков</h1>
    <div className="max-w-2xl">
      {mockBlocks.map(block => (
        <TestBlock key={block.id} block={block} />
      ))}
    </div>
  </div>
);
