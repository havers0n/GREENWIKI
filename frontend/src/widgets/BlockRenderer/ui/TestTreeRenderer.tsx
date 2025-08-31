import React from 'react';
import type { BlockNode } from '../../../types/api';
import BlockRenderer from './BlockRenderer';

// Тестовые данные для проверки древовидной структуры
const testBlockTree: BlockNode[] = [
  {
    id: 'root-1',
    block_type: 'container',
    content: null,
    depth: 0,
    instance_id: null,
    metadata: {},
    page_id: 1,
    parent_block_id: null,
    position: 0,
    slot: null,
    status: 'published',
    children: [
      {
        id: 'child-1',
        block_type: 'heading',
        content: { text: 'Заголовок 1 уровня', level: 1 },
        depth: 1,
        instance_id: null,
        metadata: {},
        page_id: 1,
        parent_block_id: 'root-1',
        position: 0,
        slot: null,
        status: 'published',
        children: []
      },
      {
        id: 'child-2',
        block_type: 'paragraph',
        content: { text: 'Это параграф внутри контейнера' },
        depth: 1,
        instance_id: null,
        metadata: {},
        page_id: 1,
        parent_block_id: 'root-1',
        position: 1,
        slot: null,
        status: 'published',
        children: []
      },
      {
        id: 'child-3',
        block_type: 'container',
        content: null,
        depth: 1,
        instance_id: null,
        metadata: {},
        page_id: 1,
        parent_block_id: 'root-1',
        position: 2,
        slot: null,
        status: 'published',
        children: [
          {
            id: 'grandchild-1',
            block_type: 'heading',
            content: { text: 'Заголовок 2 уровня', level: 2 },
            depth: 2,
            instance_id: null,
            metadata: {},
            page_id: 1,
            parent_block_id: 'child-3',
            position: 0,
            slot: null,
            status: 'published',
            children: []
          },
          {
            id: 'grandchild-2',
            block_type: 'paragraph',
            content: { text: 'Это параграф во вложенном контейнере' },
            depth: 2,
            instance_id: null,
            metadata: {},
            page_id: 1,
            parent_block_id: 'child-3',
            position: 1,
            slot: null,
            status: 'published',
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 'root-2',
    block_type: 'paragraph',
    content: { text: 'Это отдельный параграф на корневом уровне' },
    depth: 0,
    instance_id: null,
    metadata: {},
    page_id: 1,
    parent_block_id: null,
    position: 1,
    slot: null,
    status: 'published',
    children: []
  }
];

interface TestTreeRendererProps {
  editorMode?: boolean;
}

const TestTreeRenderer: React.FC<TestTreeRendererProps> = ({ editorMode = false }) => {
  const [selectedBlockId, setSelectedBlockId] = React.useState<string | null>(null);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Тест древовидного рендеринга блоков
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Структура дерева:
          </h2>
          <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 font-mono text-sm">
            <pre>{JSON.stringify(testBlockTree, null, 2)}</pre>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Рендеринг блоков:
          </h2>

          <BlockRenderer
            blockTree={testBlockTree}
            editorMode={editorMode}
            selectedBlockId={selectedBlockId}
            onSelectBlock={setSelectedBlockId}
            onUpdateBlock={(updated) => {
              console.log('Block updated:', updated);
            }}
          />
        </div>

        {selectedBlockId && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Выбран блок: {selectedBlockId}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestTreeRenderer;
