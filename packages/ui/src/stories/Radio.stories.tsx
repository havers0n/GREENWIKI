import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Radio } from '../atoms/Radio';
import { RadioGroup, RadioGroupItem } from '../atoms/RadioGroup';
import { ThemeProvider } from '../contexts/ThemeContext';

const meta: Meta<typeof Radio> = {
  title: 'Atoms/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
        Универсальный компонент radio-кнопки с полной поддержкой дизайн-системы.

        ## Особенности:
        - Полная поддержка всех состояний (checked, unchecked, disabled, error)
        - Использование дизайн-токенов из tokens.json
        - Поддержка label, hint и error сообщений
        - Полная доступность (WCAG 2.1 AA)
        - Оптимизация производительности (React.memo, forwardRef)
        - Интеграция с RadioGroup для управления группами

        ## Использование в RadioGroup:
        Для создания групп radio-кнопок используйте RadioGroup с RadioGroupItem:
        \`\`\`tsx
        <RadioGroup value={selectedValue} onChange={setSelectedValue}>
          <RadioGroupItem value="option1" label="Первый вариант" />
          <RadioGroupItem value="option2" label="Второй вариант" />
        </RadioGroup>
        \`\`\`
        `,
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Текст метки для radio-кнопки',
      table: {
        defaultValue: { summary: 'undefined' },
      },
    },
    hint: {
      control: 'text',
      description: 'Вспомогательный текст, отображаемый под radio-кнопкой',
      table: {
        defaultValue: { summary: 'undefined' },
      },
    },
    error: {
      control: 'text',
      description: 'Сообщение об ошибке, отображаемое под radio-кнопкой',
      table: {
        defaultValue: { summary: 'undefined' },
      },
    },
    invalid: {
      control: 'boolean',
      description: 'Отображает radio-кнопку в состоянии ошибки (красный border)',
      table: {
        defaultValue: { summary: false },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Отключает radio-кнопку',
      table: {
        defaultValue: { summary: false },
      },
    },
    required: {
      control: 'boolean',
      description: 'Отмечает radio-кнопку как обязательную (добавляет *)',
      table: {
        defaultValue: { summary: false },
      },
    },
    containerClassName: {
      control: 'text',
      description: 'Дополнительные CSS классы для контейнера',
      table: {
        defaultValue: { summary: '""' },
      },
    },
  },

};

export default meta;
type Story = StoryObj<typeof Radio>;

// Base Radio Stories
export const Default: Story = {
  args: {
    label: 'Выберите этот вариант',
    name: 'default-radio',
  },
};

export const WithHint: Story = {
  args: {
    label: 'Вариант с подсказкой',
    hint: 'Это поможет вам сделать правильный выбор',
    name: 'hint-radio',
  },
};

export const WithError: Story = {
  args: {
    label: 'Вариант с ошибкой',
    error: 'Необходимо выбрать хотя бы один вариант',
    name: 'error-radio',
    invalid: true,
  },
};

export const Required: Story = {
  args: {
    label: 'Обязательный вариант',
    required: true,
    name: 'required-radio',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Отключенный вариант',
    disabled: true,
    name: 'disabled-radio',
  },
};

export const Checked: Story = {
  args: {
    label: 'Выбранный вариант',
    checked: true,
    name: 'checked-radio',
  },
};

// RadioGroup Stories
const RadioGroupTemplate = (args: any) => {
  const [selectedValue, setSelectedValue] = useState(args.value || 'option2');

  return (
    <RadioGroup
      label={args.label}
      value={selectedValue}
      onChange={setSelectedValue}
      error={args.error}
      disabled={args.disabled}
      required={args.required}
      orientation={args.orientation}
    >
      <RadioGroupItem
        value="option1"
        label="Первый вариант"
        hint="Это первый вариант выбора"
      />
      <RadioGroupItem
        value="option2"
        label="Второй вариант"
        hint="Это второй вариант выбора"
      />
      <RadioGroupItem
        value="option3"
        label="Третий вариант"
        hint="Это третий вариант выбора"
      />
    </RadioGroup>
  );
};

export const RadioGroupDefault: StoryObj<typeof RadioGroup> = {
  render: RadioGroupTemplate,
  args: {
    label: 'Выберите один вариант',
  },
};

export const RadioGroupWithError: StoryObj<typeof RadioGroup> = {
  render: RadioGroupTemplate,
  args: {
    label: 'Выберите один вариант',
    error: 'Пожалуйста, выберите вариант',
  },
};

export const RadioGroupDisabled: StoryObj<typeof RadioGroup> = {
  render: RadioGroupTemplate,
  args: {
    label: 'Отключенная группа',
    disabled: true,
  },
};

export const RadioGroupRequired: StoryObj<typeof RadioGroup> = {
  render: RadioGroupTemplate,
  args: {
    label: 'Обязательная группа',
    required: true,
  },
};

export const RadioGroupHorizontal: StoryObj<typeof RadioGroup> = {
  render: RadioGroupTemplate,
  args: {
    label: 'Горизонтальная группа',
    orientation: 'horizontal',
  },
};

// Real-world usage example
const LinkTypeExample = () => {
  const [linkType, setLinkType] = useState('internal');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Пример использования: Тип ссылки</h3>
      <RadioGroup
        label="Тип ссылки"
        value={linkType}
        onChange={setLinkType}
        required
      >
        <RadioGroupItem
          value="internal"
          label="Внутренняя ссылка"
          hint="Ссылка на страницу внутри сайта"
        />
        <RadioGroupItem
          value="external"
          label="Внешняя ссылка"
          hint="Ссылка на внешний ресурс"
        />
      </RadioGroup>

      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Выбран тип: <strong>{linkType === 'internal' ? 'Внутренняя' : 'Внешняя'}</strong>
        </p>
      </div>
    </div>
  );
};

export const RealWorldExample: StoryObj<typeof RadioGroup> = {
  render: () => <LinkTypeExample />,
};

// Accessibility examples
const AccessibilityExample = () => {
  const [selectedValue, setSelectedValue] = useState('option1');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Пример доступности</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Используйте клавиатуру (Tab, стрелки) для навигации по radio-кнопкам.
        Нажмите Enter или Space для выбора.
      </p>

      <RadioGroup
        label="Пример с клавиатурной навигацией"
        value={selectedValue}
        onChange={setSelectedValue}
      >
        <RadioGroupItem
          value="option1"
          label="Первый вариант (Tab + Enter)"
        />
        <RadioGroupItem
          value="option2"
          label="Второй вариант (↓ стрелка)"
        />
        <RadioGroupItem
          value="option3"
          label="Третий вариант (↑ стрелка)"
        />
      </RadioGroup>
    </div>
  );
};

export const AccessibilityDemo: StoryObj<typeof RadioGroup> = {
  render: () => <AccessibilityExample />,
};
