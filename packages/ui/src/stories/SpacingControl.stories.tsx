import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SpacingControl, SpacingValue } from '../molecules/SpacingControl';
import { InspectorField } from '../molecules/InspectorField';
import { ThemeProvider } from '../contexts/ThemeContext';

const meta: Meta<typeof SpacingControl> = {
  title: 'Molecules/SpacingControl',
  component: SpacingControl,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
        Продвинутый компонент для управления отступами с визуальной репрезентацией.

        ## Особенности:
        - Визуальная репрезентация элемента с отступами
        - Четыре поля ввода для top, right, bottom, left
        - Функция связывания значений (linked mode)
        - Полная доступность (WCAG 2.1 AA)
        - React.memo оптимизация производительности

        ## Режимы работы:
        - **Связанный режим:** Изменение одного поля обновляет все остальные
        - **Независимый режим:** Каждое поле редактируется отдельно

        ## Использование:
        \`\`\`tsx
        <SpacingControl
          value={{ top: '10px', right: '20px', bottom: '10px', left: '20px' }}
          onChange={(value) => console.log('Spacing changed:', value)}
          allowLinked={true}
        />
        \`\`\`
        `,
      },
    },
  },
  argTypes: {
    value: {
      control: 'object',
      description: 'Объект со значениями отступов',
      table: {
        defaultValue: { summary: '{}' },
      },
    },
    allowLinked: {
      control: 'boolean',
      description: 'Разрешить связывание значений',
      table: {
        defaultValue: { summary: 'true' },
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
        <div className="max-w-md">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SpacingControl>;

// Базовый пример
export const Basic: Story = {
  args: {
    value: { top: '10px', right: '20px', bottom: '10px', left: '20px' },
    onChange: (value) => console.log('Spacing changed:', value),
  },
};

// Интерактивный пример
export const Interactive: Story = {
  render: () => {
    const [spacing, setSpacing] = useState<SpacingValue>({
      top: '16px',
      right: '24px',
      bottom: '16px',
      left: '24px'
    });

    return (
      <div className="space-y-6">
        <div className="text-center">
          <SpacingControl
            value={spacing}
            onChange={setSpacing}
            allowLinked={true}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Предпросмотр
          </h3>

          <div className="flex justify-center">
            <div
              className="inline-block p-4 bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 rounded-lg"
              style={{
                paddingTop: spacing.top || '0',
                paddingRight: spacing.right || '0',
                paddingBottom: spacing.bottom || '0',
                paddingLeft: spacing.left || '0',
              }}
            >
              <div className="w-16 h-10 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-medium">DIV</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <strong>Верх:</strong> {spacing.top || '0'}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <strong>Право:</strong> {spacing.right || '0'}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <strong>Низ:</strong> {spacing.bottom || '0'}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <strong>Лево:</strong> {spacing.left || '0'}
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// Связанные значения
export const LinkedValues: Story = {
  args: {
    value: { top: '16px', right: '16px', bottom: '16px', left: '16px' },
    onChange: (value) => console.log('Linked spacing changed:', value),
    allowLinked: true,
  },
};

// Независимые значения
export const IndependentValues: Story = {
  render: () => {
    const [spacing, setSpacing] = useState<SpacingValue>({
      top: '8px',
      right: '16px',
      bottom: '24px',
      left: '12px'
    });

    return (
      <div className="space-y-4">
        <SpacingControl
          value={spacing}
          onChange={setSpacing}
          allowLinked={true}
        />

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Попробуйте изменить значение в одном поле, затем нажмите на иконку цепочки,
          чтобы увидеть разницу между связанным и независимым режимами.
        </div>
      </div>
    );
  },
};

// Отключенная возможность связывания
export const NoLinking: Story = {
  args: {
    value: { top: '10px', right: '15px', bottom: '10px', left: '15px' },
    onChange: (value) => console.log('Spacing changed:', value),
    allowLinked: false,
  },
};

// Отключенный компонент
export const Disabled: Story = {
  args: {
    value: { top: '12px', right: '18px', bottom: '12px', left: '18px' },
    onChange: (value) => console.log('Spacing changed:', value),
    disabled: true,
  },
};

// Использование внутри InspectorField
export const InsideInspectorField: Story = {
  render: () => {
    const [padding, setPadding] = useState<SpacingValue>({
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
      <div className="space-y-6">
        <InspectorField label="Внутренние отступы (Padding)">
          <SpacingControl
            value={padding}
            onChange={setPadding}
            allowLinked={true}
          />
        </InspectorField>

        <InspectorField label="Внешние отступы (Margin)">
          <SpacingControl
            value={margin}
            onChange={setMargin}
            allowLinked={true}
          />
        </InspectorField>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Предпросмотр настроек
          </h3>

          <div className="flex justify-center">
            <div
              className="inline-block border-2 border-gray-300 dark:border-gray-600 rounded"
              style={{
                marginTop: margin.top || '0',
                marginRight: margin.right || '0',
                marginBottom: margin.bottom || '0',
                marginLeft: margin.left || '0',
                paddingTop: padding.top || '0',
                paddingRight: padding.right || '0',
                paddingBottom: padding.bottom || '0',
                paddingLeft: padding.left || '0',
              }}
            >
              <div className="w-20 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-medium">CONTENT</span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <strong>Padding:</strong><br />
              T: {padding.top}, R: {padding.right}<br />
              B: {padding.bottom}, L: {padding.left}
            </div>
            <div>
              <strong>Margin:</strong><br />
              T: {margin.top}, R: {margin.right}<br />
              B: {margin.bottom}, L: {margin.left}
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
    const [spacing, setSpacing] = useState<SpacingValue>({
      top: '1rem',
      right: '2rem',
      bottom: '1.5rem',
      left: '1rem'
    });

    return (
      <div className="space-y-4">
        <SpacingControl
          value={spacing}
          onChange={setSpacing}
          allowLinked={true}
        />

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Поддерживаются различные единицы измерения: px, rem, em, %, vh, vw и другие CSS единицы.
        </div>
      </div>
    );
  },
};
