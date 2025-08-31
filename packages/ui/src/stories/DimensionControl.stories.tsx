import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DimensionControl, DimensionValue } from '../molecules/DimensionControl';
import { InspectorField } from '../molecules/InspectorField';
import { ThemeProvider } from '../contexts/ThemeContext';

const meta: Meta<typeof DimensionControl> = {
  title: 'Molecules/DimensionControl',
  component: DimensionControl,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
        Компонент для управления размерами элементов и их ограничениями.

        ## Особенности:
        - Управление width и height
        - Опциональные ограничения (min/max width/height)
        - Визуальный предпросмотр с размерными линиями
        - Полная доступность (WCAG 2.1 AA)
        - React.memo оптимизация производительности

        ## Использование:
        \`\`\`tsx
        <DimensionControl
          value={{ width: '200px', height: '100px', minWidth: '100px' }}
          onChange={(value) => console.log('Dimensions changed:', value)}
          showConstraints={true}
        />
        \`\`\`
        `,
      },
    },
  },
  argTypes: {
    value: {
      control: 'object',
      description: 'Объект с размерами и ограничениями',
      table: {
        defaultValue: { summary: '{}' },
      },
    },
    showConstraints: {
      control: 'boolean',
      description: 'Показывать поля ограничений (min/max)',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Отключить компонент',
      table: {
        defaultValue: { summary: false },
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="max-w-lg">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DimensionControl>;

// Базовый пример
export const Basic: Story = {
  args: {
    value: { width: '200px', height: '100px' },
    onChange: (value) => console.log('Dimensions changed:', value),
  },
};

// С ограничениями
export const WithConstraints: Story = {
  args: {
    value: {
      width: '300px',
      height: '150px',
      minWidth: '200px',
      maxWidth: '500px',
      minHeight: '100px',
      maxHeight: '300px'
    },
    onChange: (value) => console.log('Dimensions changed:', value),
    showConstraints: true,
  },
};

// Интерактивный пример
export const Interactive: Story = {
  render: () => {
    const [dimensions, setDimensions] = useState<DimensionValue>({
      width: '250px',
      height: '120px',
      minWidth: '150px',
      maxWidth: '400px',
    });

    return (
      <div className="space-y-6">
        <div className="text-center">
          <DimensionControl
            value={dimensions}
            onChange={setDimensions}
            showConstraints={true}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Предпросмотр
          </h3>

          <div className="flex justify-center">
            <div
              className="relative bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-medium shadow-lg"
              style={{
                width: dimensions.width || '200px',
                height: dimensions.height || '100px',
                minWidth: dimensions.minWidth || '100px',
                maxWidth: dimensions.maxWidth || '500px',
                minHeight: dimensions.minHeight || '50px',
                maxHeight: dimensions.maxHeight || '300px',
              }}
            >
              <div className="text-center">
                <div className="text-sm">Контент</div>
                <div className="text-xs opacity-75">
                  {dimensions.width} × {dimensions.height}
                </div>
              </div>

              {/* Ограничения */}
              {dimensions.minWidth && (
                <div className="absolute -bottom-8 left-0 text-xs text-red-500">
                  min: {dimensions.minWidth}
                </div>
              )}
              {dimensions.maxWidth && (
                <div className="absolute -bottom-8 right-0 text-xs text-red-500">
                  max: {dimensions.maxWidth}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <strong>Width:</strong> {dimensions.width || 'auto'}
              {dimensions.minWidth && <div className="text-xs text-gray-600">Min: {dimensions.minWidth}</div>}
              {dimensions.maxWidth && <div className="text-xs text-gray-600">Max: {dimensions.maxWidth}</div>}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <strong>Height:</strong> {dimensions.height || 'auto'}
              {dimensions.minHeight && <div className="text-xs text-gray-600">Min: {dimensions.minHeight}</div>}
              {dimensions.maxHeight && <div className="text-xs text-gray-600">Max: {dimensions.maxHeight}</div>}
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// Только основные размеры
export const BasicDimensions: Story = {
  args: {
    value: { width: '320px', height: '180px' },
    onChange: (value) => console.log('Basic dimensions changed:', value),
    showConstraints: false,
  },
};

// Отключенный компонент
export const Disabled: Story = {
  args: {
    value: { width: '200px', height: '100px', minWidth: '100px' },
    onChange: (value) => console.log('Dimensions changed:', value),
    showConstraints: true,
    disabled: true,
  },
};

// Использование внутри InspectorField
export const InsideInspectorField: Story = {
  render: () => {
    const [dimensions, setDimensions] = useState<DimensionValue>({
      width: '280px',
      height: '160px',
    });

    return (
      <div className="space-y-6">
        <InspectorField label="Размеры изображения">
          <DimensionControl
            value={dimensions}
            onChange={setDimensions}
            showConstraints={false}
          />
        </InspectorField>

        <InspectorField label="Размеры контейнера с ограничениями">
          <DimensionControl
            value={{
              width: '100%',
              height: 'auto',
              minWidth: '200px',
              maxWidth: '1200px',
              minHeight: '100px',
              maxHeight: '800px',
            }}
            onChange={(value) => console.log('Container dimensions:', value)}
            showConstraints={true}
          />
        </InspectorField>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Текущие значения
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <strong>Изображение:</strong><br />
              Width: {dimensions.width}<br />
              Height: {dimensions.height}
            </div>
            <div>
              <strong>Контейнер:</strong><br />
              Width: 100%<br />
              Height: auto<br />
              Min/Max: 200px - 1200px
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// Различные единицы измерения
export const DifferentUnits: Story = {
  render: () => {
    const [dimensions, setDimensions] = useState<DimensionValue>({
      width: '50%',
      height: '200px',
    });

    return (
      <div className="space-y-4">
        <DimensionControl
          value={dimensions}
          onChange={setDimensions}
          showConstraints={false}
        />

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Поддерживаются различные единицы измерения CSS: px, %, rem, em, vh, vw и другие.
        </div>
      </div>
    );
  },
};
