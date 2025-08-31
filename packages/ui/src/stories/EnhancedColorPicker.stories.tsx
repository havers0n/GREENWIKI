import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { EnhancedColorPicker } from '../molecules/EnhancedColorPicker';
import { InspectorField } from '../molecules/InspectorField';
import { ThemeProvider } from '../contexts/ThemeContext';

const meta: Meta<typeof EnhancedColorPicker> = {
  title: 'Molecules/EnhancedColorPicker',
  component: EnhancedColorPicker,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
        Продвинутый компонент для выбора цвета с поддержкой HEX, RGBA и предустановленных цветов.

        ## Особенности:
        - Визуальный индикатор текущего цвета
        - Текстовое поле для ручного ввода цвета
        - Всплывающая палитра с нативным color picker
        - Опциональная поддержка прозрачности (alpha)
        - Предустановленные цвета для быстрого выбора
        - Полная доступность (WCAG 2.1 AA)
        - React.memo оптимизация производительности

        ## Использование:
        \`\`\`tsx
        <EnhancedColorPicker
          value="#ff6b6b"
          onChange={(color) => console.log(color)}
          showAlpha={true}
          presets={['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4']}
        />
        \`\`\`
        `,
      },
    },
  },
  argTypes: {
    value: {
      control: 'color',
      description: 'Текущий цвет в формате HEX или RGBA',
      table: {
        defaultValue: { summary: '#000000' },
      },
    },
    showAlpha: {
      control: 'boolean',
      description: 'Показывать слайдер прозрачности',
      table: {
        defaultValue: { summary: false },
      },
    },
    presets: {
      control: 'object',
      description: 'Массив предустановленных цветов',
      table: {
        defaultValue: { summary: '[]' },
      },
    },
    placeholder: {
      control: 'text',
      description: 'Плейсхолдер для текстового поля',
      table: {
        defaultValue: { summary: 'Выберите цвет' },
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
type Story = StoryObj<typeof EnhancedColorPicker>;

// Базовый пример
export const Basic: Story = {
  args: {
    value: '#ff6b6b',
    onChange: (color) => console.log('Color changed:', color),
  },
};

// С поддержкой прозрачности
export const WithAlpha: Story = {
  args: {
    value: 'rgba(255, 107, 107, 0.8)',
    onChange: (color) => console.log('Color changed:', color),
    showAlpha: true,
  },
};

// С предустановленными цветами
export const WithPresets: Story = {
  args: {
    value: '#ff6b6b',
    onChange: (color) => console.log('Color changed:', color),
    presets: [
      '#ff6b6b',
      '#4ecdc4',
      '#45b7d1',
      '#96ceb4',
      '#feca57',
      '#ff9ff3',
      '#54a0ff',
      '#5f27cd',
      '#00d2d3',
      '#ff9f43',
      '#ee5a24',
      '#009432'
    ],
  },
};

// Полный пример со всеми возможностями
export const FullFeatured: Story = {
  args: {
    value: 'rgba(255, 107, 107, 0.8)',
    onChange: (color) => console.log('Color changed:', color),
    showAlpha: true,
    presets: [
      '#ff6b6b',
      '#4ecdc4',
      '#45b7d1',
      '#96ceb4',
      '#feca57',
      '#ff9ff3'
    ],
    placeholder: 'Выберите или введите цвет',
  },
};

// Отключенный компонент
export const Disabled: Story = {
  args: {
    value: '#ff6b6b',
    onChange: (color) => console.log('Color changed:', color),
    disabled: true,
  },
};

// Использование внутри InspectorField
export const InsideInspectorField: Story = {
  render: () => {
    const [color, setColor] = useState('#ff6b6b');

    return (
      <div className="space-y-4">
        <InspectorField
          label="Цвет фона"
          hint="Выберите цвет для фона блока"
        >
          <EnhancedColorPicker
            value={color}
            onChange={setColor}
            presets={['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4']}
          />
        </InspectorField>

        <InspectorField
          label="Цвет текста с прозрачностью"
          hint="Выберите цвет текста с поддержкой прозрачности"
        >
          <EnhancedColorPicker
            value="rgba(255, 107, 107, 0.8)"
            onChange={(newColor) => console.log('Text color:', newColor)}
            showAlpha={true}
            presets={['rgba(0,0,0,1)', 'rgba(255,255,255,1)', 'rgba(255,107,107,0.8)']}
          />
        </InspectorField>

        <div className="p-4 rounded-lg" style={{ backgroundColor: color }}>
          <p className="text-white font-medium">
            Предпросмотр: Текущий цвет фона - {color}
          </p>
        </div>
      </div>
    );
  },
};

// Пример с различными цветовыми форматами
export const ColorFormats: Story = {
  render: () => {
    const [colors, setColors] = useState({
      hex: '#ff6b6b',
      hexShort: '#f06',
      rgba: 'rgba(255, 107, 107, 0.8)',
      rgb: 'rgb(255, 107, 107)'
    });

    const updateColor = (key: keyof typeof colors, value: string) => {
      setColors(prev => ({ ...prev, [key]: value }));
    };

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Поддержка различных форматов цвета
        </h3>

        <InspectorField label="HEX (6 символов)">
          <EnhancedColorPicker
            value={colors.hex}
            onChange={(value) => updateColor('hex', value)}
          />
        </InspectorField>

        <InspectorField label="HEX (3 символа)">
          <EnhancedColorPicker
            value={colors.hexShort}
            onChange={(value) => updateColor('hexShort', value)}
          />
        </InspectorField>

        <InspectorField label="RGBA">
          <EnhancedColorPicker
            value={colors.rgba}
            onChange={(value) => updateColor('rgba', value)}
            showAlpha={true}
          />
        </InspectorField>

        <InspectorField label="RGB">
          <EnhancedColorPicker
            value={colors.rgb}
            onChange={(value) => updateColor('rgb', value)}
          />
        </InspectorField>

        <div className="grid grid-cols-2 gap-4 mt-6">
          {Object.entries(colors).map(([key, color]) => (
            <div key={key} className="text-center">
              <div
                className="w-full h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 mb-2"
                style={{ backgroundColor: color }}
              />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase">
                {key}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {color}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  },
};
