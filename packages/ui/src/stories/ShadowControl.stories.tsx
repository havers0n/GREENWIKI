import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ShadowControl, ShadowValue } from '../molecules/ShadowControl';
import { InspectorField } from '../molecules/InspectorField';
import { ThemeProvider } from '../contexts/ThemeContext';

const meta: Meta<typeof ShadowControl> = {
  title: 'Molecules/ShadowControl',
  component: ShadowControl,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
        Компонент для выбора тени из предустановленных вариантов с визуальными превью.

        ## Особенности:
        - 5 предустановленных вариантов теней (none, sm, md, lg, xl)
        - Визуальные превью для каждого варианта
        - CSS значения теней из дизайн-системы
        - Активное состояние с визуальным индикатором
        - Полная доступность (WCAG 2.1 AA)
        - React.memo оптимизация производительности

        ## Варианты теней:
        - **none**: Без тени
        - **sm**: Маленькая тень (0 1px 2px 0 rgb(0 0 0 / 0.05))
        - **md**: Средняя тень (0 4px 6px -1px rgb(0 0 0 / 0.1))
        - **lg**: Большая тень (0 10px 15px -3px rgb(0 0 0 / 0.1))
        - **xl**: Очень большая тень (0 20px 25px -5px rgb(0 0 0 / 0.1))

        ## Использование:
        \`\`\`tsx
        <ShadowControl
          value="md"
          onChange={(value) => console.log('Shadow changed:', value)}
        />
        \`\`\`
        `,
      },
    },
  },
  argTypes: {
    value: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      description: 'Текущее значение тени',
      table: {
        defaultValue: { summary: 'none' },
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
type Story = StoryObj<typeof ShadowControl>;

// Базовый пример
export const Basic: Story = {
  args: {
    value: 'md',
    onChange: (value) => console.log('Shadow changed:', value),
  },
};

// Все варианты теней
export const AllVariants: Story = {
  render: () => {
    const variants: ShadowValue[] = ['none', 'sm', 'md', 'lg', 'xl'];
    const [selected, setSelected] = useState<ShadowValue>('md');

    return (
      <div className="space-y-6">
        <ShadowControl
          value={selected}
          onChange={setSelected}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Все варианты теней
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {variants.map((variant) => {
              const shadows = {
                none: 'none',
                sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
              };

              return (
                <div
                  key={variant}
                  className={`p-4 bg-white dark:bg-gray-700 rounded-lg border-2 cursor-pointer transition-all ${
                    selected === variant
                      ? 'border-blue-500 shadow-md'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                  style={{ boxShadow: shadows[variant] }}
                  onClick={() => setSelected(variant)}
                >
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded mx-auto mb-2"></div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 uppercase">
                      {variant}
                    </div>
                    {selected === variant && (
                      <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                        ✓ Выбрано
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  },
};

// Интерактивный пример
export const Interactive: Story = {
  render: () => {
    const [shadow, setShadow] = useState<ShadowValue>('md');

    const getShadowValue = (value: ShadowValue) => {
      const shadows = {
        none: 'none',
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      };
      return shadows[value];
    };

    return (
      <div className="space-y-6">
        <div className="text-center">
          <ShadowControl
            value={shadow}
            onChange={setShadow}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Предпросмотр
          </h3>

          <div className="flex justify-center">
            <div
              className="w-48 h-32 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center"
              style={{ boxShadow: getShadowValue(shadow) }}
            >
              <div className="text-center">
                <div className="w-12 h-8 bg-blue-500 rounded mb-2 mx-auto"></div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {shadow === 'none' ? 'Без тени' :
                   shadow === 'sm' ? 'Маленькая тень' :
                   shadow === 'md' ? 'Средняя тень' :
                   shadow === 'lg' ? 'Большая тень' : 'Очень большая тень'}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <strong>CSS значение:</strong><br />
            <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">
              {getShadowValue(shadow)}
            </code>
          </div>
        </div>
      </div>
    );
  },
};

// Различные значения
export const None: Story = {
  args: {
    value: 'none',
    onChange: (value) => console.log('Shadow changed:', value),
  },
};

export const Small: Story = {
  args: {
    value: 'sm',
    onChange: (value) => console.log('Shadow changed:', value),
  },
};

export const Medium: Story = {
  args: {
    value: 'md',
    onChange: (value) => console.log('Shadow changed:', value),
  },
};

export const Large: Story = {
  args: {
    value: 'lg',
    onChange: (value) => console.log('Shadow changed:', value),
  },
};

export const ExtraLarge: Story = {
  args: {
    value: 'xl',
    onChange: (value) => console.log('Shadow changed:', value),
  },
};

// Отключенный компонент
export const Disabled: Story = {
  args: {
    value: 'md',
    onChange: (value) => console.log('Shadow changed:', value),
    disabled: true,
  },
};

// Использование внутри InspectorField
export const InsideInspectorField: Story = {
  render: () => {
    const [cardShadow, setCardShadow] = useState<ShadowValue>('sm');
    const [buttonShadow, setButtonShadow] = useState<ShadowValue>('md');
    const [modalShadow, setModalShadow] = useState<ShadowValue>('lg');

    const getShadowCSS = (value: ShadowValue) => {
      const shadows = {
        none: 'none',
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      };
      return shadows[value];
    };

    return (
      <div className="space-y-6">
        <InspectorField label="Тень карточки">
          <ShadowControl
            value={cardShadow}
            onChange={setCardShadow}
          />
        </InspectorField>

        <InspectorField label="Тень кнопки">
          <ShadowControl
            value={buttonShadow}
            onChange={setButtonShadow}
          />
        </InspectorField>

        <InspectorField label="Тень модального окна">
          <ShadowControl
            value={modalShadow}
            onChange={setModalShadow}
          />
        </InspectorField>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Предпросмотр элементов
          </h3>

          <div className="flex flex-wrap gap-4 justify-center">
            {/* Карточка */}
            <div
              className="w-32 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
              style={{ boxShadow: getShadowCSS(cardShadow) }}
            >
              <div className="text-center">
                <div className="w-6 h-4 bg-blue-500 rounded mb-2"></div>
                <div className="text-xs text-gray-900 dark:text-gray-100">Карточка</div>
              </div>
            </div>

            {/* Кнопка */}
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              style={{ boxShadow: getShadowCSS(buttonShadow) }}
            >
              Кнопка
            </button>

            {/* Модальное окно */}
            <div
              className="w-40 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
              style={{ boxShadow: getShadowCSS(modalShadow) }}
            >
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Модальное</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">окно</div>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            Текущие тени: Карточка ({cardShadow}) | Кнопка ({buttonShadow}) | Модальное ({modalShadow})
          </div>
        </div>
      </div>
    );
  },
};
