import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { BorderControl, BorderValue } from '../molecules/BorderControl';
import { InspectorField } from '../molecules/InspectorField';
import { ThemeProvider } from '../contexts/ThemeContext';

const meta: Meta<typeof BorderControl> = {
  title: 'Molecules/BorderControl',
  component: BorderControl,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
        Продвинутый компонент для управления границами элементов с визуальной репрезентацией.

        ## Особенности:
        - Визуальная репрезентация элемента с границами
        - Управление толщиной, стилем, цветом и радиусом
        - Логика связывания границ (как в SpacingControl)
        - Опциональные контролы для расширенных настроек
        - Полная доступность (WCAG 2.1 AA)
        - React.memo оптимизация производительности

        ## Использование:
        \`\`\`tsx
        <BorderControl
          value={{ width: '2px', style: 'solid', color: '#333', radius: '4px' }}
          onChange={(value) => console.log('Border changed:', value)}
          showStyle={true}
          showRadius={true}
        />
        \`\`\`
        `,
      },
    },
  },
  argTypes: {
    value: {
      control: 'object',
      description: 'Объект с настройками границы',
      table: {
        defaultValue: { summary: '{}' },
      },
    },
    showStyle: {
      control: 'boolean',
      description: 'Показывать селектор стиля границы',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    showRadius: {
      control: 'boolean',
      description: 'Показывать контрол радиуса скругления',
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
        <div className="max-w-md">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BorderControl>;

// Базовый пример
export const Basic: Story = {
  args: {
    value: { width: '2px', color: '#333333' },
    onChange: (value) => console.log('Border changed:', value),
  },
};

// С расширенными настройками
export const WithAdvanced: Story = {
  args: {
    value: {
      width: '3px',
      style: 'dashed',
      color: '#007acc',
      radius: '8px'
    },
    onChange: (value) => console.log('Border changed:', value),
    showStyle: true,
    showRadius: true,
  },
};

// Интерактивный пример
export const Interactive: Story = {
  render: () => {
    const [border, setBorder] = useState<BorderValue>({
      width: '2px',
      style: 'solid',
      color: '#4a90e2',
      radius: '4px',
    });

    return (
      <div className="space-y-6">
        <div className="text-center">
          <BorderControl
            value={border}
            onChange={setBorder}
            showStyle={true}
            showRadius={true}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Предпросмотр
          </h3>

          <div className="flex justify-center">
            <div
              className="w-32 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center text-sm font-medium text-blue-800 dark:text-blue-200"
              style={{
                borderWidth: border.width || '0',
                borderStyle: border.style || 'solid',
                borderColor: border.color || 'transparent',
                borderRadius: border.radius || '0',
              }}
            >
              Элемент
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <strong>Толщина:</strong> {border.width || '0'}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <strong>Стиль:</strong> {border.style || 'solid'}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <strong>Цвет:</strong> {border.color || 'transparent'}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <strong>Радиус:</strong> {border.radius || '0'}
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// Только основные настройки
export const BasicBorder: Story = {
  args: {
    value: { width: '1px', color: '#cccccc' },
    onChange: (value) => console.log('Basic border changed:', value),
    showStyle: false,
    showRadius: false,
  },
};

// Стиль границы
export const WithStyle: Story = {
  args: {
    value: { width: '2px', style: 'dashed', color: '#666666' },
    onChange: (value) => console.log('Border with style changed:', value),
    showStyle: true,
    showRadius: false,
  },
};

// Радиус скругления
export const WithRadius: Story = {
  args: {
    value: { width: '2px', color: '#333333', radius: '8px' },
    onChange: (value) => console.log('Border with radius changed:', value),
    showStyle: false,
    showRadius: true,
  },
};

// Отключенный компонент
export const Disabled: Story = {
  args: {
    value: { width: '2px', style: 'solid', color: '#333333', radius: '4px' },
    onChange: (value) => console.log('Border changed:', value),
    showStyle: true,
    showRadius: true,
    disabled: true,
  },
};

// Использование внутри InspectorField
export const InsideInspectorField: Story = {
  render: () => {
    const [cardBorder, setCardBorder] = useState<BorderValue>({
      width: '1px',
      style: 'solid',
      color: '#e2e8f0',
      radius: '8px',
    });

    const [buttonBorder, setButtonBorder] = useState<BorderValue>({
      width: '2px',
      color: '#3b82f6',
      radius: '6px',
    });

    return (
      <div className="space-y-6">
        <InspectorField label="Граница карточки">
          <BorderControl
            value={cardBorder}
            onChange={setCardBorder}
            showStyle={true}
            showRadius={true}
          />
        </InspectorField>

        <InspectorField label="Граница кнопки">
          <BorderControl
            value={buttonBorder}
            onChange={setButtonBorder}
            showStyle={false}
            showRadius={true}
          />
        </InspectorField>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Предпросмотр
          </h3>

          <div className="flex gap-4 justify-center">
            {/* Карточка */}
            <div
              className="p-4 bg-white dark:bg-gray-800 text-center"
              style={{
                borderWidth: cardBorder.width || '0',
                borderStyle: cardBorder.style || 'solid',
                borderColor: cardBorder.color || 'transparent',
                borderRadius: cardBorder.radius || '0',
              }}
            >
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Карточка</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Описание</p>
            </div>

            {/* Кнопка */}
            <button
              className="px-4 py-2 bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
              style={{
                borderWidth: buttonBorder.width || '0',
                borderStyle: buttonBorder.style || 'solid',
                borderColor: buttonBorder.color || 'transparent',
                borderRadius: buttonBorder.radius || '0',
              }}
            >
              Кнопка
            </button>
          </div>
        </div>
      </div>
    );
  },
};

// Различные стили границ
export const BorderStyles: Story = {
  render: () => {
    const [border, setBorder] = useState<BorderValue>({
      width: '2px',
      style: 'solid',
      color: '#333333',
    });

    return (
      <div className="space-y-4">
        <BorderControl
          value={border}
          onChange={setBorder}
          showStyle={true}
          showRadius={false}
        />

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Попробуйте разные стили границ: solid, dashed, dotted
        </div>
      </div>
    );
  },
};
