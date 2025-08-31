import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { InspectorField } from '../molecules/InspectorField';
import { Input } from '../atoms/Input';
import { Select } from '../atoms/Select';
import { Switch } from '../atoms/Switch';
import { Button } from '../atoms/Button';
import { Textarea } from '../atoms/Textarea';
import { ThemeProvider } from '../contexts/ThemeContext';

const meta: Meta<typeof InspectorField> = {
  title: 'Molecules/InspectorField',
  component: InspectorField,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
        Универсальная обертка для любого контрола с консистентными лейблами и отступами.

        ## Особенности:
        - Консистентные отступы для всех типов контролов
        - Поддержка лейблов, подсказок и ошибок
        - Автоматическая интеграция с design tokens
        - Полная доступность (WCAG 2.1 AA)
        - React.memo оптимизация производительности

        ## Использование:
        \`\`\`tsx
        <InspectorField label="Название" hint="Введите название блока">
          <Input placeholder="Название" />
        </InspectorField>
        \`\`\`
        `,
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Лейбл для поля',
      table: {
        defaultValue: { summary: 'undefined' },
      },
    },
    hint: {
      control: 'text',
      description: 'Подсказка под полем',
      table: {
        defaultValue: { summary: 'undefined' },
      },
    },
    error: {
      control: 'text',
      description: 'Текст ошибки',
      table: {
        defaultValue: { summary: 'undefined' },
      },
    },
    required: {
      control: 'boolean',
      description: 'Показывать маркер обязательности',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    children: {
      control: false,
      description: 'Контрол, который будет обернут',
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
type Story = StoryObj<typeof InspectorField>;

// Пример с Input
export const WithInput: Story = {
  args: {
    label: 'Название блока',
    hint: 'Введите уникальное название для блока',
    children: <Input placeholder="Мой блок" size="sm" />,
  },
};

// Пример с Select и hint
export const WithSelect: Story = {
  args: {
    label: 'Тип блока',
    hint: 'Выберите тип блока из списка',
    children: (
      <Select size="sm">
        <option value="">Выберите тип...</option>
        <option value="container">Контейнер</option>
        <option value="button">Кнопка</option>
        <option value="heading">Заголовок</option>
        <option value="paragraph">Параграф</option>
      </Select>
    ),
  },
};

// Пример с Switch
export const WithSwitch: Story = {
  args: {
    label: 'Показывать заголовок',
    hint: 'Включите, чтобы отобразить заголовок блока',
    children: <Switch defaultChecked={true} />,
  },
};

// Пример с Textarea
export const WithTextarea: Story = {
  args: {
    label: 'Описание',
    hint: 'Подробное описание блока (опционально)',
    children: <Textarea placeholder="Введите описание..." rows={3} />,
  },
};

// Пример с ошибкой
export const WithError: Story = {
  args: {
    label: 'Email',
    error: 'Некорректный формат email адреса',
    children: <Input placeholder="example@email.com" size="sm" invalid />,
  },
};

// Пример с обязательным полем
export const RequiredField: Story = {
  args: {
    label: 'Название',
    hint: 'Это поле обязательно для заполнения',
    required: true,
    children: <Input placeholder="Обязательное поле" size="sm" />,
  },
};

// Пример без лейбла (только подсказка)
export const WithoutLabel: Story = {
  args: {
    hint: 'Дополнительная информация о поле',
    children: <Input placeholder="Поле без лейбла" size="sm" />,
  },
};

// Пример с Button (нестандартное использование)
export const WithButton: Story = {
  args: {
    label: 'Действие',
    hint: 'Нажмите кнопку для выполнения действия',
    children: <Button size="sm">Выполнить</Button>,
  },
};
