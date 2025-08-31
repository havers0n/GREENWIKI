import React, { useState } from 'react';
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Card, Typography, Button } from '@my-forum/ui';
import { VirtualizedCanvas } from '../widgets/VirtualizedCanvas';
import type { BlockNode } from '../types/api';

/**
 * Тестовая страница для проверки функциональности вложенности блоков через D&D
 */
const DnDTestPage: React.FC = () => {
  // Создаем тестовое дерево блоков
  const [blockTree, setBlockTree] = useState<BlockNode[]>([
    {
      id: 'container-1',
      block_type: 'container',
      content: { title: 'Контейнер для теста', layout: 'vertical' },
      depth: 0,
      instance_id: null,
      metadata: {},
      page_id: 1,
      position: 0,
      slot: null,
      status: 'published',
      children: []
    },
    {
      id: 'block-1',
      block_type: 'single_button',
      content: { text: 'Кнопка 1' },
      depth: 0,
      instance_id: null,
      metadata: {},
      page_id: 1,
      position: 1,
      slot: null,
      status: 'published',
      children: []
    },
    {
      id: 'block-2',
      block_type: 'single_button',
      content: { text: 'Кнопка 2' },
      depth: 0,
      instance_id: null,
      metadata: {},
      page_id: 1,
      position: 2,
      slot: null,
      status: 'published',
      children: []
    }
  ]);

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleDragStart = () => {
    addTestResult('Начато перетаскивание блока');
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) {
      addTestResult('Блок отпущен вне зоны сброса');
      return;
    }

    const activeId = String(active.id ?? '');
    const overId = String(over.id ?? '');

    addTestResult(`Блок "${activeId}" отпущен над "${overId}"`);

    if (overId.startsWith('dropzone-')) {
      const dropZoneMatch = overId.match(/^dropzone-(.+)-(\d+)-(.+)$/);
      if (dropZoneMatch) {
        const [, parentIdRaw, positionStr] = dropZoneMatch;
        const parentId = parentIdRaw === 'root' ? null : parentIdRaw;
        const position = Number(positionStr);

        addTestResult(`Вложение: блок "${activeId}" -> родитель "${parentId}", позиция ${position}`);

        // Обновляем состояние для тестирования визуальных изменений
        setBlockTree(prevTree => {
          // Находим блок для перемещения
          const blockToMove = prevTree.find(b => b.id === activeId);
          if (!blockToMove) return prevTree;

          // Удаляем блок из текущего места
          const withoutBlock = prevTree.filter(b => b.id !== activeId);

          // Добавляем блок в новое место
          const updatedBlock = {
            ...blockToMove,
            parent_block_id: parentId,
            position: position
          };

          if (parentId === null) {
            // Добавляем в корень
            withoutBlock.splice(position, 0, updatedBlock);
          } else {
            // Добавляем как дочерний элемент
            return withoutBlock.map(block => {
              if (block.id === parentId) {
                const newChildren = [...(block.children || [])];
                newChildren.splice(position, 0, updatedBlock);
                return { ...block, children: newChildren };
              }
              return block;
            });
          }

          return withoutBlock;
        });
      }
    }
  };

  const resetTest = () => {
    setBlockTree([
      {
        id: 'container-1',
        block_type: 'container',
        content: { title: 'Контейнер для теста', layout: 'vertical' },
        depth: 0,
        instance_id: null,
        metadata: {},
        page_id: 1,
        position: 0,
        slot: null,
        status: 'published',
        children: []
      },
      {
        id: 'block-1',
        block_type: 'single_button',
        content: { text: 'Кнопка 1' },
        depth: 0,
        instance_id: null,
        metadata: {},
        page_id: 1,
        position: 1,
        slot: null,
        status: 'published',
        children: []
      },
      {
        id: 'block-2',
        block_type: 'single_button',
        content: { text: 'Кнопка 2' },
        depth: 0,
        instance_id: null,
        metadata: {},
        page_id: 1,
        position: 2,
        slot: null,
        status: 'published',
        children: []
      }
    ]);
    setSelectedBlockId(null);
    setTestResults([]);
    addTestResult('Тест сброшен');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Typography variant="h1" className="text-3xl font-bold mb-4">
          Тест Вложенности Блоков (D&D)
        </Typography>

        <Typography variant="body1" className="text-gray-600 mb-6">
          Эта страница предназначена для тестирования функциональности вложенности блоков через Drag & Drop.
          Попробуйте перетащить кнопки внутрь контейнера.
        </Typography>

        <div className="flex gap-4 mb-6">
          <Button
            onClick={resetTest}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
          >
            Сбросить тест
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Основная область тестирования */}
        <div className="space-y-6">
          <Card className="p-6">
            <Typography variant="h2" className="text-xl font-semibold mb-4">
              Тестовая область
            </Typography>

            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <VirtualizedCanvas
                blockTree={blockTree}
                editorMode={true}
                selectedBlockId={selectedBlockId}
                onSelectBlock={setSelectedBlockId}
                onUpdateBlock={() => {}}
                isCanvasOver={false}
              />
            </DndContext>
          </Card>
        </div>

        {/* Панель результатов */}
        <div className="space-y-6">
          <Card className="p-6">
            <Typography variant="h2" className="text-xl font-semibold mb-4">
              Результаты тестирования
            </Typography>

            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Результаты появятся здесь после действий с блоками
                </p>
              ) : (
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono bg-white p-2 rounded border">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <Typography variant="h2" className="text-xl font-semibold mb-4">
              Структура блоков
            </Typography>

            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(
                  blockTree.map(block => ({
                    id: block.id,
                    type: block.block_type,
                    childrenCount: block.children?.length || 0,
                    position: block.position
                  })),
                  null,
                  2
                )}
              </pre>
            </div>
          </Card>

          <Card className="p-6">
            <Typography variant="h2" className="text-xl font-semibold mb-4">
              Инструкции по тестированию
            </Typography>

            <div className="space-y-3 text-sm text-gray-600">
              <p>1. <strong>Перетащите кнопку внутрь контейнера</strong> - должна появиться синяя рамка</p>
              <p>2. <strong>Отпустите кнопку</strong> - она должна стать дочерним элементом контейнера</p>
              <p>3. <strong>Посмотрите на результаты</strong> - в логе должны появиться сообщения о вложении</p>
              <p>4. <strong>Проверьте структуру</strong> - childrenCount контейнера должен увеличиться</p>
              <p>5. <strong>Повторите с другой кнопкой</strong> - проверьте правильность позиций</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
        <Typography variant="body2" className="text-green-800">
          <strong>Успех:</strong> Если кнопки успешно перемещаются внутрь контейнера и структура блоков обновляется,
          значит функциональность вложенности работает корректно!
        </Typography>
      </div>
    </div>
  );
};

export default DnDTestPage;
