import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../atoms/Button';
import { ThemeProvider } from '../contexts/ThemeContext';
import { Save, Download, ExternalLink, Plus, Trash2, Settings, Mail, Phone } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
        Универсальный компонент кнопки с полной поддержкой дизайн-системы.

        ## Особенности:
        - Полная поддержка всех состояний (default, hover, focus, active, disabled, loading)
        - Использование дизайн-токенов из tokens.json
        - Поддержка иконок (leftIcon, rightIcon)
        - Автоматическая интеграция со Spinner в состоянии loading
        - Полная доступность (WCAG 2.1 AA)
        - Оптимизация производительности (React.memo, useCallback)
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger', 'ghost'],
      description: 'Вариант стиля кнопки',
      table: {
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Размер кнопки',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    loading: {
      control: 'boolean',
      description: 'Показывать состояние загрузки (отключает кнопку и показывает Spinner)',
      table: {
        defaultValue: { summary: false },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Отключить кнопку',
      table: {
        defaultValue: { summary: false },
      },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Растянуть кнопку на всю ширину контейнера',
      table: {
        defaultValue: { summary: false },
      },
    },
    leftIcon: {
      control: false,
      description: 'Иконка слева от текста',
    },
    rightIcon: {
      control: false,
      description: 'Иконка справа от текста',
    },
    children: {
      control: 'text',
      description: 'Содержимое кнопки',
    },
    onClick: {
      action: 'clicked',
      description: 'Обработчик клика',
    },
  },

};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Основная кнопка',
    variant: 'primary',
    size: 'md',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Вторичная кнопка',
    variant: 'secondary',
    size: 'md',
  },
};

export const Danger: Story = {
  args: {
    children: 'Удалить',
    variant: 'danger',
    size: 'md',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Отмена',
    variant: 'ghost',
    size: 'md',
  },
};

export const Loading: Story = {
  args: {
    children: 'Сохранение...',
    variant: 'primary',
    size: 'md',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Отключена',
    variant: 'primary',
    size: 'md',
    disabled: true,
  },
};

export const WithLeftIcon: Story = {
  args: {
    children: 'Сохранить',
    variant: 'primary',
    size: 'md',
    leftIcon: Save,
  },
};

export const WithRightIcon: Story = {
  args: {
    children: 'Далее',
    variant: 'primary',
    size: 'md',
    rightIcon: ExternalLink,
  },
};

export const FullWidth: Story = {
  args: {
    children: 'Растянуть на всю ширину',
    variant: 'primary',
    size: 'md',
    fullWidth: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <div className="flex items-center gap-4">
        <Button size="xs">XS</Button>
        <Button size="sm">SM</Button>
        <Button size="md">MD</Button>
        <Button size="lg">LG</Button>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Размеры кнопок: XS (24px), SM (32px), MD (40px), LG (48px)
      </div>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4">
        <Button variant="primary">Default</Button>
        <Button variant="primary" loading>Loading</Button>
        <Button variant="primary" disabled>Disabled</Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <Button variant="secondary">Default</Button>
        <Button variant="secondary" loading>Loading</Button>
        <Button variant="secondary" disabled>Disabled</Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <Button variant="ghost">Default</Button>
        <Button variant="ghost" loading>Loading</Button>
        <Button variant="ghost" disabled>Disabled</Button>
      </div>
    </div>
  ),
};

export const IconsExamples: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4">
        <Button variant="primary" leftIcon={Mail}>
          Отправить email
        </Button>
        <Button variant="secondary" leftIcon={Download}>
          Скачать
        </Button>
        <Button variant="ghost" rightIcon={ExternalLink}>
          Открыть в новой вкладке
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <Button variant="primary" size="sm" leftIcon={Plus}>
          Добавить
        </Button>
        <Button variant="danger" size="sm" leftIcon={Trash2}>
          Удалить
        </Button>
        <Button variant="secondary" size="sm" rightIcon={Settings}>
          Настройки
        </Button>
      </div>
    </div>
  ),
};

export const FormButtons: Story = {
  render: () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-w-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Создать новую категорию
      </h3>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Название
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Введите название"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Slug
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="category-slug"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="ghost" size="sm">
          Отмена
        </Button>
        <Button variant="primary" size="sm" leftIcon={Save}>
          Сохранить
        </Button>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    children: 'Нажми меня',
    variant: 'primary',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Интерактивная кнопка для тестирования всех состояний.',
      },
    },
  },
};
