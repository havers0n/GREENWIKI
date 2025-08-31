import React, { useState } from 'react';
import { ContextualInspector } from './ContextualInspector';
import { InspectorSection } from '../InspectorSection';
import { InspectorField } from '../InspectorField';
import { ControlRenderer } from './ControlRenderer';
import { inspectorRegistry } from './inspectorRegistry';

/**
 * Пример использования новой декларативной системы конфигурации ContextualInspector
 * Этот файл демонстрирует, как работают конфигурации и как легко добавлять новые блоки
 */
export const InspectorConfigExample: React.FC = () => {
  const [selectedBlock, setSelectedBlock] = useState<any>({
    id: '1',
    block_type: 'heading',
    content: {
      text: 'Пример заголовка',
      level: 'h2',
    },
    metadata: {
      color: '#2563eb',
      alignment: 'center',
      spacing: {
        top: '16px',
        right: '24px',
        bottom: '16px',
        left: '24px',
      },
    },
    status: 'draft',
    position: 1,
  });

  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const handleBlockChange = (updatedBlock: any) => {
    setSelectedBlock(updatedBlock);
    console.log('Block updated:', updatedBlock);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Конфигурационная Система ContextualInspector
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Левая колонка - демонстрация */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Демонстрация
          </h2>

          {/* Блок для демонстрации */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-800">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Предпросмотр блока
                </h3>
                <button
                  onClick={() => setIsInspectorOpen(true)}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  ✏️ Редактировать
                </button>
              </div>

              {/* Предпросмотр содержимого блока */}
              <div className="space-y-3">
                <div
                  style={{
                    color: selectedBlock.metadata?.color || '#000000',
                    textAlign: selectedBlock.metadata?.alignment || 'left',
                    paddingTop: selectedBlock.metadata?.spacing?.top || '0',
                    paddingRight: selectedBlock.metadata?.spacing?.right || '0',
                    paddingBottom: selectedBlock.metadata?.spacing?.bottom || '0',
                    paddingLeft: selectedBlock.metadata?.spacing?.left || '0',
                  }}
                >
                  <div
                    className={`font-bold ${
                      selectedBlock.content?.level === 'h1' ? 'text-3xl' :
                      selectedBlock.content?.level === 'h2' ? 'text-2xl' :
                      selectedBlock.content?.level === 'h3' ? 'text-xl' :
                      'text-lg'
                    }`}
                  >
                    {selectedBlock.content?.text || 'Пустой заголовок'}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 border-t pt-3">
                Тип блока: <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">{selectedBlock.block_type}</code>
              </div>
            </div>
          </div>

          {/* Выбор типа блока */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Выберите тип блока для демонстрации
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(inspectorRegistry).map((blockType) => (
                <button
                  key={blockType}
                  onClick={() => {
                    const config = inspectorRegistry[blockType];
                    const defaultBlock = {
                      id: '1',
                      block_type: blockType,
                      content: {},
                      metadata: {},
                      status: 'draft',
                      position: 1,
                    };

                    // Заполняем дефолтными значениями из конфигурации
                    config.forEach(section => {
                      section.controls.forEach(control => {
                        if (['text', 'href', 'level', 'id', 'description'].includes(control.propName)) {
                          if (control.type === 'Input') {
                            (defaultBlock.content as any)[control.propName] = control.placeholder || '';
                          } else if (control.type === 'Select' && control.options?.length > 0) {
                            (defaultBlock.content as any)[control.propName] = control.options[0].value;
                          }
                        }
                      });
                    });

                    setSelectedBlock(defaultBlock);
                  }}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    selectedBlock.block_type === blockType
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {blockType.replace('_', ' ')}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {inspectorRegistry[blockType].length} секций настроек
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Правая колонка - конфигурация */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Конфигурация
          </h2>

          {/* Текущая конфигурация блока */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Конфигурация блока "{selectedBlock.block_type}"
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {inspectorRegistry[selectedBlock.block_type]?.map((section, sectionIndex) => (
                <InspectorSection
                  key={sectionIndex}
                  title={section.title}
                  icon={section.icon}
                  collapsible={false}
                  defaultExpanded={true}
                >
                  <div className="space-y-3">
                    {section.controls.map((control, controlIndex) => {
                      const isContentField = ['text', 'href', 'level', 'id', 'description'].includes(control.propName);
                      const dataSource = isContentField ? selectedBlock.content : selectedBlock.metadata;
                      const currentValue = dataSource?.[control.propName];

                      return (
                        <div key={controlIndex} className="border border-gray-200 dark:border-gray-600 rounded p-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                            {control.label}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Тип: <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">{control.type}</code>
                            • Поле: <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">{control.propName}</code>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                            Текущее значение: {JSON.stringify(currentValue) || 'undefined'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </InspectorSection>
              )) || (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Конфигурация для блока типа "{selectedBlock.block_type}" не найдена
                </div>
              )}
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

export default InspectorConfigExample;
