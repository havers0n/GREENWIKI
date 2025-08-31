import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AlignmentControl, AlignmentValue } from '../molecules/AlignmentControl';
import { InspectorField } from '../molecules/InspectorField';
import { ThemeProvider } from '../contexts/ThemeContext';

const meta: Meta<typeof AlignmentControl> = {
  title: 'Molecules/AlignmentControl',
  component: AlignmentControl,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
        Компонент для управления выравниванием текста и блоков.

        ## Особенности:
        - Группа из 4-х иконок для разных типов выравнивания
        - Визуальная индикация активного состояния
        - Полная доступность (WCAG 2.1 AA)
        - React.memo оптимизация производительности
        - Построен на базе ActionIcon компонента

        ## Доступные значения:
        - \`left\` - Выравнивание по левому краю
        - \`center\` - Выравнивание по центру
        - \`right\` - Выравнивание по правому краю
        - \`justify\` - Выравнивание по ширине

        ## Использование:
        \`\`\`tsx
        <AlignmentControl
          value="center"
          onChange={(value) => console.log('Alignment changed:', value)}
          size="sm"
        />
        \`\`\`
        `,
      },
    },
  },
  argTypes: {
    value: {
      control: 'select',
      options: ['left', 'center', 'right', 'justify'],
      description: 'Текущее значение выравнивания',
      table: {
        defaultValue: { summary: 'left' },
      },
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Размер компонента',
      table: {
        defaultValue: { summary: 'sm' },
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
type Story = StoryObj<typeof AlignmentControl>;

// Базовый пример с управляемым состоянием
export const Basic: Story = {
  args: {
    value: 'left',
    onChange: (value) => console.log('Alignment changed:', value),
  },
};

// Интерактивный пример
export const Interactive: Story = {
  render: () => {
    const [alignment, setAlignment] = useState<AlignmentValue>('left');

    return (
      <div className="space-y-4">
        <div className="text-center">
          <AlignmentControl
            value={alignment}
            onChange={setAlignment}
            size="md"
          />
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p
            className="text-lg"
            style={{
              textAlign: alignment === 'justify' ? 'justify' : alignment
            }}
          >
            Это пример текста с выравниванием: <strong>{alignment}</strong>.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Текущее выравнивание: <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">{alignment}</code>
        </p>
      </div>
    );
  },
};

// Примеры для каждого значения
export const Left: Story = {
  args: {
    value: 'left',
    onChange: (value) => console.log('Alignment changed:', value),
  },
};

export const Center: Story = {
  args: {
    value: 'center',
    onChange: (value) => console.log('Alignment changed:', value),
  },
};

export const Right: Story = {
  args: {
    value: 'right',
    onChange: (value) => console.log('Alignment changed:', value),
  },
};

export const Justify: Story = {
  args: {
    value: 'justify',
    onChange: (value) => console.log('Alignment changed:', value),
  },
};

// Маленький размер
export const SmallSize: Story = {
  args: {
    value: 'center',
    onChange: (value) => console.log('Alignment changed:', value),
    size: 'sm',
  },
};

// Большой размер
export const MediumSize: Story = {
  args: {
    value: 'center',
    onChange: (value) => console.log('Alignment changed:', value),
    size: 'md',
  },
};

// Отключенный компонент
export const Disabled: Story = {
  args: {
    value: 'left',
    onChange: (value) => console.log('Alignment changed:', value),
    disabled: true,
  },
};

// Использование внутри InspectorField
export const InsideInspectorField: Story = {
  render: () => {
    const [textAlignment, setTextAlignment] = useState<AlignmentValue>('left');
    const [blockAlignment, setBlockAlignment] = useState<AlignmentValue>('center');

    return (
      <div className="space-y-6">
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
            size="sm"
          />
        </InspectorField>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Предпросмотр настроек:
          </h3>

          <div
            className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border"
            style={{
              textAlign: textAlignment === 'justify' ? 'justify' : textAlignment,
              alignSelf: blockAlignment === 'left' ? 'flex-start' :
                        blockAlignment === 'center' ? 'center' :
                        blockAlignment === 'right' ? 'flex-end' : 'stretch'
            }}
          >
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Текст с выравниванием: {textAlignment}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Блок с выравниванием: {blockAlignment}
            </p>
          </div>
        </div>
      </div>
    );
  },
};

// Пример с кастомными стилями
export const CustomStyling: Story = {
  args: {
    value: 'center',
    onChange: (value) => console.log('Alignment changed:', value),
    className: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  },
};
