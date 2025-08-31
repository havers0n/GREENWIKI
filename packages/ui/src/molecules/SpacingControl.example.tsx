import React, { useState } from 'react';
import { SpacingControl, SpacingValue } from './SpacingControl';
import { InspectorField } from './InspectorField';

/**
 * Пример использования SpacingControl
 * Этот файл демонстрирует различные варианты использования компонента
 */
export const SpacingControlExample: React.FC = () => {
  const [spacing, setSpacing] = useState<SpacingValue>({
    top: '16px',
    right: '24px',
    bottom: '16px',
    left: '24px'
  });

  const [margin, setMargin] = useState<SpacingValue>({
    top: '8px',
    right: '12px',
    bottom: '8px',
    left: '12px'
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        SpacingControl - Примеры использования
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Основной пример */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Управление отступами
          </h2>

          <InspectorField label="Отступы элемента">
            <SpacingControl
              value={spacing}
              onChange={setSpacing}
              allowLinked={true}
            />
          </InspectorField>

          <InspectorField label="Внешние отступы">
            <SpacingControl
              value={margin}
              onChange={setMargin}
              allowLinked={true}
            />
          </InspectorField>
        </div>

        {/* Предпросмотр */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Предпросмотр
          </h2>

          <div className="flex justify-center items-center min-h-64 bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
            <div
              className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
              style={{
                marginTop: margin.top || '0',
                marginRight: margin.right || '0',
                marginBottom: margin.bottom || '0',
                marginLeft: margin.left || '0',
                paddingTop: spacing.top || '0',
                paddingRight: spacing.right || '0',
                paddingBottom: spacing.bottom || '0',
                paddingLeft: spacing.left || '0',
              }}
            >
              {/* Визуальные индикаторы отступов */}
              {margin.top && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-1 rounded">
                  margin-top: {margin.top}
                </div>
              )}

              {margin.right && (
                <div className="absolute top-1/2 -right-16 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-1 rounded">
                  margin-right: {margin.right}
                </div>
              )}

              {margin.bottom && (
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-1 rounded">
                  margin-bottom: {margin.bottom}
                </div>
              )}

              {margin.left && (
                <div className="absolute top-1/2 -left-16 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-1 rounded">
                  margin-left: {margin.left}
                </div>
              )}

              {/* Основной контент */}
              <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded p-4 min-w-32 min-h-20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-12 bg-blue-500 rounded-lg mx-auto mb-2"></div>
                  <div className="text-xs text-blue-800 dark:text-blue-200">
                    Контент
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Информация о значениях */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Padding</h3>
              <div className="space-y-1 text-gray-600 dark:text-gray-400">
                <div>T: {spacing.top || '0'}</div>
                <div>R: {spacing.right || '0'}</div>
                <div>B: {spacing.bottom || '0'}</div>
                <div>L: {spacing.left || '0'}</div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Margin</h3>
              <div className="space-y-1 text-gray-600 dark:text-gray-400">
                <div>T: {margin.top || '0'}</div>
                <div>R: {margin.right || '0'}</div>
                <div>B: {margin.bottom || '0'}</div>
                <div>L: {margin.left || '0'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Различные режимы */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Режимы работы
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Связанные значения</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Все четыре стороны имеют одинаковое значение. Изменение одного поля обновляет все остальные.
            </p>
            <SpacingControl
              value={{ top: '20px', right: '20px', bottom: '20px', left: '20px' }}
              onChange={(value) => console.log('Linked:', value)}
              allowLinked={true}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Независимые значения</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Каждая сторона имеет свое значение. Изменение одного поля не затрагивает другие.
            </p>
            <SpacingControl
              value={{ top: '10px', right: '20px', bottom: '15px', left: '25px' }}
              onChange={(value) => console.log('Independent:', value)}
              allowLinked={true}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Без связывания</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Только независимый режим. Иконка цепочки не отображается.
            </p>
            <SpacingControl
              value={{ top: '12px', right: '18px', bottom: '12px', left: '18px' }}
              onChange={(value) => console.log('No linking:', value)}
              allowLinked={false}
            />
          </div>
        </div>
      </div>

      {/* Различные единицы измерения */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          Поддержка единиц измерения
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { unit: 'px', value: { top: '16px', right: '24px', bottom: '16px', left: '24px' } },
            { unit: 'rem', value: { top: '1rem', right: '1.5rem', bottom: '1rem', left: '1.5rem' } },
            { unit: 'em', value: { top: '1em', right: '1.2em', bottom: '1em', left: '1.2em' } },
            { unit: '%', value: { top: '10%', right: '15%', bottom: '10%', left: '15%' } },
          ].map(({ unit, value }) => (
            <div key={unit} className="space-y-2">
              <h3 className="text-sm font-medium text-center">{unit.toUpperCase()}</h3>
              <SpacingControl
                value={value}
                onChange={(newValue) => console.log(`${unit}:`, newValue)}
                allowLinked={true}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpacingControlExample;
