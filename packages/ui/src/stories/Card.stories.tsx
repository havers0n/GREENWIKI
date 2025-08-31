import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardShadow, CardPadding } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { ThemeProvider } from '../contexts/ThemeContext';
import { Save, Download, ExternalLink, Plus, Trash2, Settings, Mail, Phone } from 'lucide-react';

const meta: Meta<typeof Card> = {
  title: 'Atoms/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
        Универсальный компонент карточки с полной поддержкой дизайн-системы.

        ## Особенности:
        - Полная поддержка дизайн-токенов из tokens.json
        - Гибкая система теней (none, sm, md, lg)
        - Адаптивная система отступов (none, sm, md, lg)
        - Опциональная рамка
        - Hover эффекты и плавные переходы
        - React.memo оптимизация производительности
        - forwardRef поддержка

        ## Использование:
        \`\`\`tsx
        <Card shadow="md" padding="lg" withBorder>
          <h3>Заголовок карточки</h3>
          <p>Содержимое карточки</p>
        </Card>
        \`\`\`
        `,
      },
    },
  },
  argTypes: {
    shadow: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Уровень тени карточки',
      table: {
        defaultValue: { summary: 'sm' },
      },
    },
    padding: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Внутренние отступы карточки',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    withBorder: {
      control: 'boolean',
      description: 'Показывать рамку вокруг карточки',
      table: {
        defaultValue: { summary: true },
      },
    },
    children: {
      control: 'text',
      description: 'Содержимое карточки',
    },
  },

};

export default meta;
type Story = StoryObj<typeof Card>;

// Basic Card Stories
export const Default: Story = {
  args: {
    children: (
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
          Базовая карточка
        </h3>
        <p className="text-[var(--color-text-secondary)]">
          Это стандартная карточка с базовыми настройками: средняя тень, средние отступы и рамка.
        </p>
      </div>
    ),
  },
};

export const WithoutBorder: Story = {
  args: {
    withBorder: false,
    children: (
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
          Карточка без рамки
        </h3>
        <p className="text-[var(--color-text-secondary)]">
          Эта карточка не имеет рамки, что делает её более минималистичной.
        </p>
      </div>
    ),
  },
};

export const NoShadow: Story = {
  args: {
    shadow: 'none',
    children: (
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
          Карточка без тени
        </h3>
        <p className="text-[var(--color-text-secondary)]">
          Эта карточка не имеет тени, что делает её плоской.
        </p>
      </div>
    ),
  },
};

export const LargeShadow: Story = {
  args: {
    shadow: 'lg',
    children: (
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
          Карточка с большой тенью
        </h3>
        <p className="text-[var(--color-text-secondary)]">
          Эта карточка имеет большую тень для большего выделения.
        </p>
      </div>
    ),
  },
};

export const SmallPadding: Story = {
  args: {
    padding: 'sm',
    children: (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
          Компактная карточка
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Эта карточка имеет минимальные отступы для компактного отображения информации.
        </p>
      </div>
    ),
  },
};

export const LargePadding: Story = {
  args: {
    padding: 'lg',
    children: (
      <div className="space-y-4">
        <h3 className="text-xl font-medium text-[var(--color-text-primary)]">
          Просторная карточка
        </h3>
        <p className="text-[var(--color-text-secondary)]">
          Эта карточка имеет большие отступы для комфортного чтения и размещения контента.
        </p>
        <div className="bg-[var(--color-bg-tertiary)] p-3 rounded-lg">
          <p className="text-sm text-[var(--color-text-muted)]">
            Дополнительный контент может быть размещен здесь.
          </p>
        </div>
      </div>
    ),
  },
};

export const NoPadding: Story = {
  args: {
    padding: 'none',
    children: (
      <div className="p-4 space-y-3">
        <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
          Карточка без внутренних отступов
        </h3>
        <p className="text-[var(--color-text-secondary)]">
          Эта карточка не имеет внутренних отступов. Отступы нужно добавлять вручную в содержимое.
        </p>
      </div>
    ),
  },
};

export const Shadows: Story = {
  args: {
    children: (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card shadow="none">
          <div className="text-center">
            <div className="text-2xl mb-2">🚫</div>
            <h4 className="font-medium text-[var(--color-text-primary)]">Без тени</h4>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">shadow-none</p>
          </div>
        </Card>

        <Card shadow="sm">
          <div className="text-center">
            <div className="text-2xl mb-2">💨</div>
            <h4 className="font-medium text-[var(--color-text-primary)]">Маленькая</h4>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">shadow-sm</p>
          </div>
        </Card>

        <Card shadow="md">
          <div className="text-center">
            <div className="text-2xl mb-2">💫</div>
            <h4 className="font-medium text-[var(--color-text-primary)]">Средняя</h4>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">shadow-md</p>
          </div>
        </Card>

        <Card shadow="lg">
          <div className="text-center">
            <div className="text-2xl mb-2">🌟</div>
            <h4 className="font-medium text-[var(--color-text-primary)]">Большая</h4>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">shadow-lg</p>
          </div>
        </Card>
      </div>
    ),
  },
};

export const Paddings: Story = {
  args: {
    children: (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card padding="none">
          <div className="p-4 text-center">
            <div className="text-2xl mb-2">📏</div>
            <h4 className="font-medium text-[var(--color-text-primary)]">Без отступов</h4>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">padding-none</p>
          </div>
        </Card>

        <Card padding="sm">
          <div className="text-center">
            <div className="text-2xl mb-2">📐</div>
            <h4 className="font-medium text-[var(--color-text-primary)]">Маленькие</h4>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">padding-sm</p>
          </div>
        </Card>

        <Card padding="md">
          <div className="text-center">
            <div className="text-2xl mb-2">📏</div>
            <h4 className="font-medium text-[var(--color-text-primary)]">Средние</h4>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">padding-md</p>
          </div>
        </Card>

        <Card padding="lg">
          <div className="text-center">
            <div className="text-2xl mb-2">📏</div>
            <h4 className="font-medium text-[var(--color-text-primary)]">Большие</h4>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">padding-lg</p>
          </div>
        </Card>
      </div>
    ),
  },
};

export const InteractiveCard: Story = {
  args: {
    shadow: 'md',
    padding: 'lg',
    children: (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-[var(--color-text-primary)]">
          Интерактивная карточка
        </h3>

        <div className="space-y-3">
          <Input
            label="Название"
            placeholder="Введите название"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Цена"
              type="number"
              placeholder="0"
            />
            <Input
              label="Количество"
              type="number"
              placeholder="1"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-[var(--color-border-default)]">
            <Button variant="secondary">
              Отмена
            </Button>
            <Button>
              Сохранить
            </Button>
          </div>
        </div>
      </div>
    ),
  },
};

export const CardGrid: Story = {
  args: {
    children: (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card shadow="md" padding="md">
          <div className="text-center">
            <div className="text-3xl mb-3">📊</div>
            <h4 className="font-medium text-[var(--color-text-primary)] mb-2">
              Аналитика
            </h4>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Просмотр статистики и отчетов
            </p>
          </div>
        </Card>

        <Card shadow="md" padding="md">
          <div className="text-center">
            <div className="text-3xl mb-3">⚙️</div>
            <h4 className="font-medium text-[var(--color-text-primary)] mb-2">
              Настройки
            </h4>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Конфигурация системы
            </p>
          </div>
        </Card>

        <Card shadow="md" padding="md">
          <div className="text-center">
            <div className="text-3xl mb-3">👥</div>
            <h4 className="font-medium text-[var(--color-text-primary)] mb-2">
              Пользователи
            </h4>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Управление учетными записями
            </p>
          </div>
        </Card>
      </div>
    ),
  },
};
