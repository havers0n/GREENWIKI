import React, { useState } from 'react';
import { ContextualInspector } from './ContextualInspector';
import { getBlockInspectorConfig, hasBlockInspectorConfig } from './inspectorRegistry';

/**
 * Пример тестирования полной миграции на декларативную систему ContextualInspector
 * Этот файл демонстрирует работу всех мигрированных блоков
 */
export const InspectorMigrationExample: React.FC = () => {
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Список всех доступных блоков из inspectorRegistry
  const availableBlocks = Object.keys(require('./inspectorRegistry').inspectorRegistry);

  const selectBlock = (blockType: string) => {
    const config = getBlockInspectorConfig(blockType);
    if (config) {
      // Создаем тестовый блок с дефолтными значениями
      const testBlock = {
        id: `test-${blockType}-${Date.now()}`,
        block_type: blockType,
        content: {},
        metadata: {},
        status: 'draft',
        position: 1,
      };

      // Заполняем дефолтными значениями из конфигурации
      config.forEach(section => {
        section.controls.forEach(control => {
          const defaultValue = getDefaultValueForControl(control);
          if (defaultValue !== undefined) {
            const isContentField = ['text', 'href', 'level', 'id', 'description', 'content', 'title'].includes(control.propName);
            const target = isContentField ? testBlock.content : testBlock.metadata;
            (target as any)[control.propName] = defaultValue;
          }
        });
      });

      setSelectedBlock(testBlock);
      setIsInspectorOpen(true);
    }
  };

  const handleBlockChange = (updatedBlock: any) => {
    setSelectedBlock(updatedBlock);
    console.log('Block updated:', updatedBlock);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Полная Миграция ContextualInspector
      </h1>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
          <span className="text-xl">✅</span>
          <span className="font-medium">Все блоки успешно мигрированы на декларативную систему!</span>
        </div>
        <p className="text-sm text-green-700 dark:text-green-300 mt-2">
          Теперь ContextualInspector работает без единого условного оператора, используя только декларативные конфигурации.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Левая колонка - выбор блока */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Выберите блок для тестирования
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {availableBlocks.map((blockType) => {
              const config = getBlockInspectorConfig(blockType);
              const hasConfig = hasBlockInspectorConfig(blockType);
              const sectionCount = config?.length || 0;

              return (
                <button
                  key={blockType}
                  onClick={() => selectBlock(blockType)}
                  className={`p-4 border rounded-lg text-left transition-all hover:shadow-md ${
                    hasConfig
                      ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 hover:border-green-300'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed'
                  }`}
                  disabled={!hasConfig}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">
                      {getBlockTypeIcon(blockType)}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {blockType.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {hasConfig ? `${sectionCount} секций настроек` : 'Конфигурация не найдена'}
                  </div>
                  {hasConfig && (
                    <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                      ✅ Готов к использованию
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedBlock && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">
                Текущий блок: {selectedBlock.block_type}
              </h3>

              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <div><strong>ID:</strong> {selectedBlock.id}</div>
                <div><strong>Статус:</strong> {selectedBlock.status}</div>
                <div><strong>Позиция:</strong> {selectedBlock.position}</div>

                {Object.keys(selectedBlock.content || {}).length > 0 && (
                  <div>
                    <strong>Content:</strong>
                    <pre className="mt-1 text-xs bg-blue-100 dark:bg-blue-800 p-2 rounded overflow-x-auto">
                      {JSON.stringify(selectedBlock.content, null, 2)}
                    </pre>
                  </div>
                )}

                {Object.keys(selectedBlock.metadata || {}).length > 0 && (
                  <div>
                    <strong>Metadata:</strong>
                    <pre className="mt-1 text-xs bg-blue-100 dark:bg-blue-800 p-2 rounded overflow-x-auto">
                      {JSON.stringify(selectedBlock.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Правая колонка - статистика миграции */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Статистика миграции
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {availableBlocks.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Всего блоков
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {availableBlocks.filter(blockType => hasBlockInspectorConfig(blockType)).length}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Мигрировано
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                Преимущества новой системы:
              </div>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>✅ Полностью декларативная</li>
                <li>✅ Легко расширяемая</li>
                <li>✅ Без жестких зависимостей</li>
                <li>✅ Единообразный интерфейс</li>
                <li>✅ Автоматическая типизация</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-lg font-medium text-purple-900 dark:text-purple-100 mb-2">
                Удаленный код:
              </div>
              <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                <li>❌ if (block.block_type === 'heading')</li>
                <li>❌ switch (blockType) конструкции</li>
                <li>❌ Жесткие зависимости</li>
                <li>❌ Условная логика рендеринга</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 dark:text-yellow-400 text-xl mt-0.5">🚀</span>
              <div>
                <h3 className="font-medium text-yellow-900 dark:text-yellow-100">
                  Что дальше?
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                  Теперь можно легко добавлять новые блоки, просто создавая их декларативные конфигурации в inspectorRegistry.
                  ContextualInspector автоматически подхватит новые настройки без изменения кода!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Новый ContextualInspector */}
      <ContextualInspector
        block={selectedBlock}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onBlockChange={handleBlockChange}
      />
    </div>
  );
};

// Вспомогательные функции
function getBlockTypeIcon(blockType: string): string {
  const icons: Record<string, string> = {
    heading: '📰',
    text: '📝',
    image: '🖼️',
    button: '🔘',
    spacer: '📏',
    section: '📦',
    icon: '🔷',
    columns: '📊',
    tabs: '📑',
    accordion: '📋',
    container: '📦',
    card: '🃏',
  };
  return icons[blockType] || '📄';
}

function getDefaultValueForControl(control: any): any {
  switch (control.type) {
    case 'Input':
      if (control.inputType === 'number') return 0;
      return control.placeholder || '';
    case 'Select':
      return control.options?.[0]?.value || '';
    case 'Switch':
      return false;
    case 'Textarea':
      return control.placeholder || '';
    default:
      return undefined;
  }
}

export default InspectorMigrationExample;
