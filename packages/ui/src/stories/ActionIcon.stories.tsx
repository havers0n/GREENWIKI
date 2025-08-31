import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ActionIcon, ActionIconVariant, ActionIconSize, ActionIconColor } from '../atoms/ActionIcon';
import { ThemeProvider } from '../contexts/ThemeContext';

const meta: Meta<typeof ActionIcon> = {
  title: 'Atoms/ActionIcon',
  component: ActionIcon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
        Специализированный компонент для иконок-кнопок с полной поддержкой дизайн-системы.

        ## Особенности:
        - Полная поддержка дизайн-токенов из tokens.json
        - Квадратная форма с идеальным центрированием иконки
        - 4 варианта стиля: filled, light, outline, subtle
        - 4 размера: xs, sm, md, lg
        - 4 цветовые схемы: primary, secondary, danger, success
        - Loading состояние с автоматическим спиннером
        - React.memo оптимизация производительности
        - forwardRef поддержка
        - Обязательный aria-label для доступности

        ## Доступность:
        - Обязательный aria-label для описания действия
        - Правильная семантическая разметка
        - Поддержка клавиатурной навигации
        - Focus management

        ## Использование:
        \`\`\`tsx
        <ActionIcon
          variant="light"
          size="md"
          color="primary"
          aria-label="Удалить элемент"
        >
          <TrashIcon />
        </ActionIcon>
        \`\`\`
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['filled', 'light', 'outline', 'subtle'],
      description: 'Стиль кнопки-иконки',
      table: {
        defaultValue: { summary: 'light' },
      },
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Размер кнопки-иконки',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger', 'success'],
      description: 'Цветовая схема кнопки-иконки',
      table: {
        defaultValue: { summary: 'primary' },
      },
    },
    loading: {
      control: 'boolean',
      description: 'Показывать состояние загрузки',
      table: {
        defaultValue: { summary: false },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Отключить кнопку-иконку',
      table: {
        defaultValue: { summary: false },
      },
    },
    'aria-label': {
      control: 'text',
      description: 'Обязательная метка для доступности',
    },
    children: {
      control: 'text',
      description: 'Иконка или контент кнопки',
    },
  },

};

export default meta;
type Story = StoryObj<typeof ActionIcon>;

// Helper component for demo icons
const DemoIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Basic ActionIcon Stories
export const Default: Story = {
  args: {
    'aria-label': 'Добавить элемент',
    children: <DemoIcon />,
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex gap-4">
      <ActionIcon variant="filled" aria-label="Filled variant">
        <DemoIcon />
      </ActionIcon>

      <ActionIcon variant="light" aria-label="Light variant">
        <DemoIcon />
      </ActionIcon>

      <ActionIcon variant="outline" aria-label="Outline variant">
        <DemoIcon />
      </ActionIcon>

      <ActionIcon variant="subtle" aria-label="Subtle variant">
        <DemoIcon />
      </ActionIcon>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <ActionIcon size="xs" aria-label="Extra small size">
        <DemoIcon size={12} />
      </ActionIcon>

      <ActionIcon size="sm" aria-label="Small size">
        <DemoIcon size={14} />
      </ActionIcon>

      <ActionIcon size="md" aria-label="Medium size">
        <DemoIcon size={16} />
      </ActionIcon>

      <ActionIcon size="lg" aria-label="Large size">
        <DemoIcon size={20} />
      </ActionIcon>
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="flex gap-4">
      <ActionIcon color="primary" aria-label="Primary color">
        <DemoIcon />
      </ActionIcon>

      <ActionIcon color="secondary" aria-label="Secondary color">
        <DemoIcon />
      </ActionIcon>

      <ActionIcon color="danger" aria-label="Danger color">
        <DemoIcon />
      </ActionIcon>

      <ActionIcon color="success" aria-label="Success color">
        <DemoIcon />
      </ActionIcon>
    </div>
  ),
};

export const LoadingState: Story = {
  render: () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = () => {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 2000);
    };

    return (
      <div className="flex gap-4">
        <ActionIcon
          variant="filled"
          loading={isLoading}
          aria-label={isLoading ? "Загрузка..." : "Начать загрузку"}
          onClick={handleClick}
        >
          <DemoIcon />
        </ActionIcon>

        <ActionIcon
          variant="light"
          loading={isLoading}
          aria-label={isLoading ? "Загрузка..." : "Начать загрузку"}
          onClick={handleClick}
        >
          <DemoIcon />
        </ActionIcon>
      </div>
    );
  },
};

export const DisabledState: Story = {
  render: () => (
    <div className="flex gap-4">
      <ActionIcon disabled aria-label="Отключенная кнопка filled">
        <DemoIcon />
      </ActionIcon>

      <ActionIcon variant="light" disabled aria-label="Отключенная кнопка light">
        <DemoIcon />
      </ActionIcon>

      <ActionIcon variant="outline" disabled aria-label="Отключенная кнопка outline">
        <DemoIcon />
      </ActionIcon>

      <ActionIcon variant="subtle" disabled aria-label="Отключенная кнопка subtle">
        <DemoIcon />
      </ActionIcon>
    </div>
  ),
};

export const VariantColorCombinations: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4">
      {/* Primary */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium text-[var(--color-text-secondary)]">Primary</h4>
        <ActionIcon variant="filled" color="primary" aria-label="Primary filled">
          <DemoIcon />
        </ActionIcon>
        <ActionIcon variant="light" color="primary" aria-label="Primary light">
          <DemoIcon />
        </ActionIcon>
        <ActionIcon variant="outline" color="primary" aria-label="Primary outline">
          <DemoIcon />
        </ActionIcon>
        <ActionIcon variant="subtle" color="primary" aria-label="Primary subtle">
          <DemoIcon />
        </ActionIcon>
      </div>

      {/* Secondary */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium text-[var(--color-text-secondary)]">Secondary</h4>
        <ActionIcon variant="filled" color="secondary" aria-label="Secondary filled">
          <DemoIcon />
        </ActionIcon>
        <ActionIcon variant="light" color="secondary" aria-label="Secondary light">
          <DemoIcon />
        </ActionIcon>
        <ActionIcon variant="outline" color="secondary" aria-label="Secondary outline">
          <DemoIcon />
        </ActionIcon>
        <ActionIcon variant="subtle" color="secondary" aria-label="Secondary subtle">
          <DemoIcon />
        </ActionIcon>
      </div>

      {/* Danger */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium text-[var(--color-text-secondary)]">Danger</h4>
        <ActionIcon variant="filled" color="danger" aria-label="Danger filled">
          <DemoIcon />
        </ActionIcon>
        <ActionIcon variant="light" color="danger" aria-label="Danger light">
          <DemoIcon />
        </ActionIcon>
        <ActionIcon variant="outline" color="danger" aria-label="Danger outline">
          <DemoIcon />
        </ActionIcon>
        <ActionIcon variant="subtle" color="danger" aria-label="Danger subtle">
          <DemoIcon />
        </ActionIcon>
      </div>

      {/* Success */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium text-[var(--color-text-secondary)]">Success</h4>
        <ActionIcon variant="filled" color="success" aria-label="Success filled">
          <DemoIcon />
        </ActionIcon>
        <ActionIcon variant="light" color="success" aria-label="Success light">
          <DemoIcon />
        </ActionIcon>
        <ActionIcon variant="outline" color="success" aria-label="Success outline">
          <DemoIcon />
        </ActionIcon>
        <ActionIcon variant="subtle" color="success" aria-label="Success subtle">
          <DemoIcon />
        </ActionIcon>
      </div>
    </div>
  ),
};

export const SizeVariantCombinations: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4">
      {/* XS */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium text-[var(--color-text-secondary)]">XS</h4>
        <ActionIcon size="xs" variant="filled" aria-label="XS filled">
          <DemoIcon size={10} />
        </ActionIcon>
        <ActionIcon size="xs" variant="light" aria-label="XS light">
          <DemoIcon size={10} />
        </ActionIcon>
        <ActionIcon size="xs" variant="outline" aria-label="XS outline">
          <DemoIcon size={10} />
        </ActionIcon>
        <ActionIcon size="xs" variant="subtle" aria-label="XS subtle">
          <DemoIcon size={10} />
        </ActionIcon>
      </div>

      {/* SM */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium text-[var(--color-text-secondary)]">SM</h4>
        <ActionIcon size="sm" variant="filled" aria-label="SM filled">
          <DemoIcon size={12} />
        </ActionIcon>
        <ActionIcon size="sm" variant="light" aria-label="SM light">
          <DemoIcon size={12} />
        </ActionIcon>
        <ActionIcon size="sm" variant="outline" aria-label="SM outline">
          <DemoIcon size={12} />
        </ActionIcon>
        <ActionIcon size="sm" variant="subtle" aria-label="SM subtle">
          <DemoIcon size={12} />
        </ActionIcon>
      </div>

      {/* MD */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium text-[var(--color-text-secondary)]">MD</h4>
        <ActionIcon size="md" variant="filled" aria-label="MD filled">
          <DemoIcon size={16} />
        </ActionIcon>
        <ActionIcon size="md" variant="light" aria-label="MD light">
          <DemoIcon size={16} />
        </ActionIcon>
        <ActionIcon size="md" variant="outline" aria-label="MD outline">
          <DemoIcon size={16} />
        </ActionIcon>
        <ActionIcon size="md" variant="subtle" aria-label="MD subtle">
          <DemoIcon size={16} />
        </ActionIcon>
      </div>

      {/* LG */}
      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium text-[var(--color-text-secondary)]">LG</h4>
        <ActionIcon size="lg" variant="filled" aria-label="LG filled">
          <DemoIcon size={20} />
        </ActionIcon>
        <ActionIcon size="lg" variant="light" aria-label="LG light">
          <DemoIcon size={20} />
        </ActionIcon>
        <ActionIcon size="lg" variant="outline" aria-label="LG outline">
          <DemoIcon size={20} />
        </ActionIcon>
        <ActionIcon size="lg" variant="subtle" aria-label="LG subtle">
          <DemoIcon size={20} />
        </ActionIcon>
      </div>
    </div>
  ),
};

export const RealWorldExample: Story = {
  render: () => {
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
          Пример использования в интерфейсе
        </h3>

        {/* Article card simulation */}
        <div className="bg-[var(--color-bg-card)] p-6 rounded-xl border border-[var(--color-border-card)] max-w-md">
          <h4 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            Статья о React
          </h4>
          <p className="text-[var(--color-text-secondary)] mb-4">
            Современные подходы к разработке пользовательских интерфейсов
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ActionIcon
                size="sm"
                variant={liked ? "filled" : "light"}
                color={liked ? "danger" : "secondary"}
                aria-label={liked ? "Убрать лайк" : "Поставить лайк"}
                onClick={() => setLiked(!liked)}
              >
                <svg className="w-4 h-4" fill={liked ? "currentColor" : "none"} viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  />
                </svg>
              </ActionIcon>

              <ActionIcon
                size="sm"
                variant={bookmarked ? "filled" : "light"}
                color="primary"
                aria-label={bookmarked ? "Убрать из закладок" : "Добавить в закладки"}
                onClick={() => setBookmarked(!bookmarked)}
              >
                <svg className="w-4 h-4" fill={bookmarked ? "currentColor" : "none"} viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                  />
                </svg>
              </ActionIcon>
            </div>

            <ActionIcon
              size="sm"
              variant="subtle"
              color="secondary"
              aria-label="Поделиться"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 1 1 0-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 1 0 5.29-2.83m-11.58 11.58a3 3 0 0 0 5.29 2.83m5.29-11.58a3 3 0 1 0-5.29-2.83"
                />
              </svg>
            </ActionIcon>
          </div>
        </div>

        <div className="bg-[var(--color-bg-tertiary)] p-4 rounded-lg">
          <p className="text-sm text-[var(--color-text-secondary)]">
            В этом примере ActionIcon используются для интерактивных элементов:
            лайк, закладки и поделиться. Обратите внимание, как меняются стили
            при взаимодействии пользователя.
          </p>
        </div>
      </div>
    );
  },
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="bg-[var(--color-bg-tertiary)] p-4 rounded-lg">
        <h4 className="font-medium text-[var(--color-text-primary)] mb-2">
          Демонстрация доступности
        </h4>
        <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
          <li>• Все ActionIcon требуют обязательный aria-label</li>
          <li>• Поддержка клавиатурной навигации (Tab, Enter, Space)</li>
          <li>• Правильные состояния для скрин-ридеров</li>
          <li>• Фокус-ринг для визуальной обратной связи</li>
        </ul>
      </div>

      <div className="flex gap-4 flex-wrap">
        <ActionIcon variant="filled" aria-label="Сохранить документ">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </ActionIcon>

        <ActionIcon variant="light" aria-label="Редактировать">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </ActionIcon>

        <ActionIcon variant="outline" aria-label="Удалить элемент">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </ActionIcon>

        <ActionIcon variant="subtle" aria-label="Показать больше опций">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </ActionIcon>
      </div>

      <div className="text-sm text-[var(--color-text-muted)]">
        Попробуйте использовать клавиатуру (Tab) для навигации по кнопкам выше.
        Каждая кнопка имеет четкое описание действия в aria-label.
      </div>
    </div>
  ),
};
