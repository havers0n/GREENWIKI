import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip, TooltipPosition } from '../atoms/Tooltip';
import { Button } from '../atoms/Button';
import { ThemeProvider } from '../contexts/ThemeContext';

const meta: Meta<typeof Tooltip> = {
  title: 'Atoms/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
        Универсальный компонент подсказки с полной поддержкой дизайн-системы и продвинутой доступностью.

        ## Особенности:
        - Полная поддержка дизайн-токенов из tokens.json
        - Умное позиционирование с проверкой границ экрана
        - Поддержка всех направлений позиционирования
        - Настраиваемая задержка появления
        - Полная доступность (WCAG 2.1 AA) с aria-describedby
        - React.memo оптимизация производительности
        - Поддержка клавиатурной навигации

        ## Доступность:
        - Автоматическая связь с триггером через aria-describedby
        - Поддержка клавиатурной навигации (Tab, Shift+Tab)
        - Правильное позиционирование для скрин-ридеров
        - Role="tooltip" для семантической разметки

        ## Использование:
        \`\`\`tsx
        <Tooltip content="Это подсказка" position="top">
          <Button>Наведи курсор</Button>
        </Tooltip>
        \`\`\`
        `,
      },
    },
  },
  argTypes: {
    content: {
      control: 'text',
      description: 'Текст подсказки',
      table: {
        defaultValue: { summary: 'undefined' },
      },
    },
    position: {
      control: { type: 'select' },
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Позиция отображения подсказки',
      table: {
        defaultValue: { summary: 'top' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Отключить подсказку',
      table: {
        defaultValue: { summary: false },
      },
    },
    delay: {
      control: { type: 'number', min: 0, max: 2000 },
      description: 'Задержка перед показом подсказки (мс)',
      table: {
        defaultValue: { summary: 300 },
      },
    },
    children: {
      control: 'text',
      description: 'Элемент-триггер подсказки',
    },
  },

};

export default meta;
type Story = StoryObj<typeof Tooltip>;

// Basic Tooltip Stories
export const Default: Story = {
  args: {
    content: 'Это базовая подсказка с текстом',
    children: <Button>Наведи курсор</Button>,
  },
};

export const LongContent: Story = {
  args: {
    content: 'Это более длинная подсказка с подробным описанием функциональности и дополнительной информацией для пользователя',
    children: <Button>Длинная подсказка</Button>,
  },
};

export const Disabled: Story = {
  args: {
    content: 'Эта подсказка отключена',
    disabled: true,
    children: <Button disabled>Отключенная кнопка</Button>,
  },
};

export const QuickShow: Story = {
  args: {
    content: 'Быстрое появление',
    delay: 100,
    children: <Button>Быстрая подсказка</Button>,
  },
};

export const SlowShow: Story = {
  args: {
    content: 'Медленное появление',
    delay: 1000,
    children: <Button>Медленная подсказка</Button>,
  },
};

export const Positions: Story = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      <Tooltip content="Подсказка сверху" position="top">
        <Button>Top</Button>
      </Tooltip>

      <Tooltip content="Подсказка снизу" position="bottom">
        <Button>Bottom</Button>
      </Tooltip>

      <Tooltip content="Подсказка слева" position="left">
        <Button>Left</Button>
      </Tooltip>

      <Tooltip content="Подсказка справа" position="right">
        <Button>Right</Button>
      </Tooltip>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip content="Сохранить изменения">
        <Button>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </Button>
      </Tooltip>

      <Tooltip content="Удалить элемент">
        <Button variant="danger">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </Button>
      </Tooltip>

      <Tooltip content="Настройки">
        <Button variant="secondary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Button>
      </Tooltip>
    </div>
  ),
};

export const InteractiveElements: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Tooltip content="Это кнопка">
          <Button>Кнопка</Button>
        </Tooltip>

        <Tooltip content="Это ссылка">
          <a href="#" className="text-[var(--color-text-link)] hover:underline">
            Ссылка
          </a>
        </Tooltip>

        <Tooltip content="Это чекбокс">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span className="text-[var(--color-text-secondary)]">Чекбокс</span>
          </label>
        </Tooltip>
      </div>

      <div className="bg-[var(--color-bg-tertiary)] p-4 rounded-lg">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Наведите курсор на элементы выше, чтобы увидеть подсказки.
          Также попробуйте использовать клавиатуру (Tab) для навигации.
        </p>
      </div>
    </div>
  ),
};

export const FormElements: Story = {
  render: () => (
    <div className="max-w-md space-y-4">
      <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
        Форма с подсказками
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
            Имя пользователя
          </label>
          <Tooltip content="Введите ваше имя пользователя (3-20 символов)">
            <input
              type="text"
              className="w-full px-3 py-2 border border-[var(--color-border-default)] rounded-lg focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:border-transparent"
              placeholder="username"
            />
          </Tooltip>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
            Пароль
          </label>
          <Tooltip content="Пароль должен содержать минимум 8 символов, включая буквы и цифры">
            <input
              type="password"
              className="w-full px-3 py-2 border border-[var(--color-border-default)] rounded-lg focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:border-transparent"
              placeholder="••••••••"
            />
          </Tooltip>
        </div>

        <div>
          <Tooltip content="Выберите ваш уровень доступа">
            <select className="w-full px-3 py-2 border border-[var(--color-border-default)] rounded-lg focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:border-transparent">
              <option>Пользователь</option>
              <option>Администратор</option>
              <option>Модератор</option>
            </select>
          </Tooltip>
        </div>
      </div>
    </div>
  ),
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="bg-[var(--color-bg-tertiary)] p-4 rounded-lg">
        <h4 className="font-medium text-[var(--color-text-primary)] mb-2">
          Демонстрация доступности
        </h4>
        <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
          <li>• Подсказки автоматически связываются с элементами через aria-describedby</li>
          <li>• Используйте Tab для навигации по элементам</li>
          <li>• Экранные читалки прочитают содержимое подсказок</li>
          <li>• Подсказки появляются при фокусе (клавиатура) и наведении (мышь)</li>
        </ul>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Tooltip content="Кнопка с подсказкой для клавиатуры">
          <Button>Tab сюда</Button>
        </Tooltip>

        <Tooltip content="Еще одна кнопка">
          <Button variant="secondary">И сюда</Button>
        </Tooltip>

        <Tooltip content="Третья кнопка в ряду">
          <Button variant="ghost">И сюда</Button>
        </Tooltip>
      </div>

      <div className="text-sm text-[var(--color-text-muted)]">
        Попробуйте использовать Tab для навигации между кнопками выше.
        Подсказки будут появляться автоматически.
      </div>
    </div>
  ),
};

export const EdgeCases: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
        Граничные случаи
      </h3>

      <div className="space-y-2">
        <Tooltip content="Обычная подсказка">
          <Button>Нормальная</Button>
        </Tooltip>

        <Tooltip content="">
          <Button>Пустая подсказка</Button>
        </Tooltip>

        <Tooltip content="Подсказка с очень длинным текстом, которая может не поместиться на экране и должна автоматически адаптироваться к границам viewport">
          <Button>Длинный текст</Button>
        </Tooltip>

        <Tooltip content="Подсказка" disabled>
          <Button disabled>Отключенная</Button>
        </Tooltip>
      </div>

      <div className="text-sm text-[var(--color-text-muted)]">
        Проверьте, как ведут себя подсказки в различных ситуациях.
      </div>
    </div>
  ),
};
