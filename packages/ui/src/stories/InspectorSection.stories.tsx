import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { InspectorSection } from '../molecules/InspectorSection';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { ThemeProvider } from '../contexts/ThemeContext';

const meta: Meta<typeof InspectorSection> = {
  title: 'Molecules/InspectorSection',
  component: InspectorSection,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
        Компонент для визуального группирования настроек в сворачиваемые секции.

        ## Особенности:
        - Плавная анимация сворачивания/разворачивания
        - Поддержка иконок в заголовке
        - Консистентные отступы и дизайн-токены
        - Полная доступность (WCAG 2.1 AA)
        - React.memo оптимизация производительности

        ## Использование:
        \`\`\`tsx
        <InspectorSection title="Настройки" icon={<SettingsIcon />}>
          <div>Содержимое секции</div>
        </InspectorSection>
        \`\`\`
        `,
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Заголовок секции',
      table: {
        defaultValue: { summary: 'undefined' },
      },
    },
    defaultExpanded: {
      control: 'boolean',
      description: 'Начальное состояние секции (развернута/свернута)',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    collapsible: {
      control: 'boolean',
      description: 'Разрешить сворачивание секции',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    icon: {
      control: 'text',
      description: 'Иконка в заголовке секции',
      table: {
        defaultValue: { summary: 'undefined' },
      },
    },
    children: {
      control: false,
      description: 'Содержимое секции',
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
type Story = StoryObj<typeof InspectorSection>;

// Стандартная сворачиваемая секция
export const Default: Story = {
  args: {
    title: 'Настройки блока',
    children: (
      <div className="space-y-3">
        <Input
          label="Название"
          placeholder="Введите название блока"
          size="sm"
        />
        <Input
          label="Описание"
          placeholder="Введите описание"
          size="sm"
        />
        <Button size="sm" className="w-full">
          Сохранить
        </Button>
      </div>
    ),
  },
};

// Изначально свернутая секция
export const InitiallyCollapsed: Story = {
  args: {
    title: 'Расширенные настройки',
    defaultExpanded: false,
    children: (
      <div className="space-y-3">
        <Input
          label="CSS классы"
          placeholder="custom-class another-class"
          size="sm"
        />
        <Input
          label="ID элемента"
          placeholder="unique-block-id"
          size="sm"
        />
        <Input
          label="Data attributes"
          placeholder="data-custom=value"
          size="sm"
        />
      </div>
    ),
  },
};

// Несворачиваемая секция
export const NonCollapsible: Story = {
  args: {
    title: 'Обязательные настройки',
    collapsible: false,
    children: (
      <div className="space-y-3">
        <Input
          label="Тип блока"
          value="Container"
          readOnly
          size="sm"
        />
        <Input
          label="Позиция"
          value="1"
          readOnly
          size="sm"
        />
      </div>
    ),
  },
};

// Секция с иконкой
export const WithIcon: Story = {
  args: {
    title: 'Дизайн',
    icon: '🎨',
    children: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="secondary">
            Цвета
          </Button>
          <Button size="sm" variant="secondary">
            Типографика
          </Button>
          <Button size="sm" variant="secondary">
            Отступы
          </Button>
          <Button size="sm" variant="secondary">
            Тени
          </Button>
        </div>
      </div>
    ),
  },
};

// Секция с большим содержимым
export const WithLargeContent: Story = {
  args: {
    title: 'Все настройки',
    children: (
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Основные настройки
          </h4>
          <div className="space-y-2">
            <Input label="Название" size="sm" />
            <Input label="Описание" size="sm" />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Внешний вид
          </h4>
          <div className="space-y-2">
            <Input label="Фон" size="sm" />
            <Input label="Цвет текста" size="sm" />
            <Input label="Размер шрифта" size="sm" />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Поведение
          </h4>
          <div className="space-y-2">
            <Input label="Ссылка" size="sm" />
            <Input label="Цель" size="sm" />
          </div>
        </div>
      </div>
    ),
  },
};
