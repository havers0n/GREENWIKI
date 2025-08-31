import React, { useState } from 'react';
import { AlignmentControl, AlignmentValue } from './AlignmentControl';
import { InspectorField } from './InspectorField';

/**
 * Пример использования AlignmentControl
 * Этот файл демонстрирует различные варианты использования компонента
 */
export const AlignmentControlExample: React.FC = () => {
  const [textAlignment, setTextAlignment] = useState<AlignmentValue>('left');
  const [blockAlignment, setBlockAlignment] = useState<AlignmentValue>('center');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        AlignmentControl - Примеры использования
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Базовый пример */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Базовый пример
          </h2>

          <InspectorField label="Выравнивание текста">
            <AlignmentControl
              value={textAlignment}
              onChange={setTextAlignment}
              size="sm"
            />
          </InspectorField>

          <InspectorField label="Выравнивание блока">
            <AlignmentControl
              value={blockAlignment}
              onChange={setBlockAlignment}
              size="md"
            />
          </InspectorField>
        </div>

        {/* Предпросмотр */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Предпросмотр
          </h2>

          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <div className="space-y-4">
              <div
                className="p-4 bg-white dark:bg-gray-700 rounded border"
                style={{
                  textAlign: textAlignment === 'justify' ? 'justify' : textAlignment,
                }}
              >
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Заголовок с выравниванием: {textAlignment}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Это пример текста с выравниванием "{textAlignment}".
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                </p>
              </div>

              <div className="flex">
                <div
                  className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-800"
                  style={{
                    alignSelf: blockAlignment === 'left' ? 'flex-start' :
                              blockAlignment === 'center' ? 'center' :
                              blockAlignment === 'right' ? 'flex-end' : 'stretch',
                    flex: blockAlignment === 'justify' ? '1' : 'none'
                  }}
                >
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Блок с выравниванием: <strong>{blockAlignment}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Все варианты выравнивания */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Все варианты выравнивания
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { value: 'left' as AlignmentValue, label: 'По левому краю' },
            { value: 'center' as AlignmentValue, label: 'По центру' },
            { value: 'right' as AlignmentValue, label: 'По правому краю' },
            { value: 'justify' as AlignmentValue, label: 'По ширине' },
          ].map(({ value, label }) => (
            <div key={value} className="space-y-3">
              <InspectorField label={label}>
                <AlignmentControl
                  value={value}
                  onChange={(newValue) => console.log(`${label}:`, newValue)}
                  size="sm"
                />
              </InspectorField>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border text-sm">
                <p style={{ textAlign: value === 'justify' ? 'justify' : value }}>
                  Пример текста с выравниванием "{label.toLowerCase()}".
                  Короткий текст для демонстрации.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Состояния компонента */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Состояния компонента
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="text-lg font-medium">Обычное состояние</h3>
            <InspectorField label="Выравнивание">
              <AlignmentControl
                value="center"
                onChange={(value) => console.log('Normal:', value)}
                size="sm"
              />
            </InspectorField>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium">Большой размер</h3>
            <InspectorField label="Выравнивание">
              <AlignmentControl
                value="center"
                onChange={(value) => console.log('Large:', value)}
                size="md"
              />
            </InspectorField>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium">Отключено</h3>
            <InspectorField label="Выравнивание">
              <AlignmentControl
                value="center"
                onChange={(value) => console.log('Disabled:', value)}
                size="sm"
                disabled={true}
              />
            </InspectorField>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlignmentControlExample;
