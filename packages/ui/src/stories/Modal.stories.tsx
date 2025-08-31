import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Modal, ModalSize } from '../molecules/Modal';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import { ThemeProvider } from '../contexts/ThemeContext';

const meta: Meta<typeof Modal> = {
  title: 'Molecules/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
        Полностью переработанный компонент модального окна с полной поддержкой дизайн-системы.

        ## Особенности:
        - Полная поддержка дизайн-токенов из tokens.json
        - Встроенный focus trap для доступности
        - Адаптивный дизайн для мобильных устройств
        - Гибкая система размеров и позиционирования
        - WCAG 2.1 AA доступность
        - Плавные анимации открытия/закрытия
        - React.memo оптимизация производительности

        ## Focus Trap:
        - Фокус автоматически перемещается в модальное окно при открытии
        - Tab навигация ограничена элементами внутри модального окна
        - При закрытии фокус возвращается на элемент, который открыл модальное окно

        ## Использование:
        \`\`\`tsx
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Модальное окно"
          size="md"
        >
          <p>Содержимое модального окна</p>
        </Modal>
        \`\`\`
        `,
      },
    },
  },
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Контролирует видимость модального окна',
      table: {
        defaultValue: { summary: false },
      },
    },
    title: {
      control: 'text',
      description: 'Заголовок модального окна',
      table: {
        defaultValue: { summary: 'undefined' },
      },
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Размер модального окна',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    centered: {
      control: 'boolean',
      description: 'Центрирование модального окна по вертикали',
      table: {
        defaultValue: { summary: true },
      },
    },
    withCloseButton: {
      control: 'boolean',
      description: 'Показывать кнопку закрытия в заголовке',
      table: {
        defaultValue: { summary: true },
      },
    },
    closeOnClickOutside: {
      control: 'boolean',
      description: 'Закрытие при клике вне модального окна',
      table: {
        defaultValue: { summary: true },
      },
    },
    closeOnEscape: {
      control: 'boolean',
      description: 'Закрытие по клавише Escape',
      table: {
        defaultValue: { summary: true },
      },
    },
  },

};

export default meta;
type Story = StoryObj<typeof Modal>;

// Basic Modal Stories
export const Default: Story = {
  args: {
    isOpen: true,
    title: 'Базовое модальное окно',
    children: (
      <div className="space-y-4">
        <p className="text-[var(--color-text-secondary)]">
          Это базовое модальное окно с заголовком и содержимым.
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">
          Модальное окно поддерживает focus trap и клавиатурную навигацию.
        </p>
      </div>
    ),
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(args.isOpen);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>
          Открыть модальное окно
        </Button>
        <Modal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      </>
    );
  },
};

export const WithoutTitle: Story = {
  args: {
    isOpen: true,
    children: (
      <div className="text-center">
        <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">
          Модальное окно без заголовка
        </h3>
        <p className="text-[var(--color-text-secondary)]">
          Заголовок может отсутствовать, а кнопка закрытия все равно доступна.
        </p>
      </div>
    ),
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(args.isOpen);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>
          Открыть без заголовка
        </Button>
        <Modal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      </>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentSize, setCurrentSize] = useState<ModalSize>(ModalSize.Md);

    const sizes = [
      { key: ModalSize.Sm, label: 'Маленькое', description: 'max-w-sm' },
      { key: ModalSize.Md, label: 'Среднее', description: 'max-w-2xl' },
      { key: ModalSize.Lg, label: 'Большое', description: 'max-w-4xl' },
      { key: ModalSize.Xl, label: 'Огромное', description: 'max-w-6xl' },
    ];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sizes.map(({ key, label, description }) => (
            <Button
              key={key}
              onClick={() => {
                setCurrentSize(key);
                setIsOpen(true);
              }}
              className="text-xs"
            >
              {label}
              <br />
              <span className="text-[var(--color-text-muted)]">{description}</span>
            </Button>
          ))}
        </div>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={`${sizes.find(s => s.key === currentSize)?.label} модальное окно`}
          size={currentSize}
        >
          <div className="space-y-4">
            <p className="text-[var(--color-text-secondary)]">
              Это {sizes.find(s => s.key === currentSize)?.label.toLowerCase()} модальное окно
              с размером <code className="bg-[var(--color-bg-tertiary)] px-1 py-0.5 rounded text-xs">
                {sizes.find(s => s.key === currentSize)?.description}
              </code>
            </p>
            <div className="bg-[var(--color-bg-tertiary)] p-4 rounded-lg">
              <p className="text-sm text-[var(--color-text-muted)]">
                Попробуйте изменить размер окна браузера, чтобы увидеть адаптивность.
              </p>
            </div>
          </div>
        </Modal>
      </div>
    );
  },
};

export const NotCentered: Story = {
  args: {
    isOpen: true,
    title: 'Модальное окно сверху',
    centered: false,
    children: (
      <p className="text-[var(--color-text-secondary)]">
        Это модальное окно позиционируется сверху страницы, а не по центру.
      </p>
    ),
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(args.isOpen);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>
          Открыть сверху
        </Button>
        <Modal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      </>
    );
  },
};

export const WithoutCloseButton: Story = {
  args: {
    isOpen: true,
    title: 'Без кнопки закрытия',
    withCloseButton: false,
    children: (
      <div className="space-y-4">
        <p className="text-[var(--color-text-secondary)]">
          У этого модального окна нет кнопки закрытия в заголовке.
        </p>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={() => {}}>
            Закрыть
          </Button>
        </div>
      </div>
    ),
  },
  render: (args) => {
    const [isOpen, setIsOpen] = useState(args.isOpen);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>
          Открыть без кнопки
        </Button>
        <Modal
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      </>
    );
  },
};

export const FormModal: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      alert('Форма отправлена!');
      setIsOpen(false);
      setName('');
      setEmail('');
      setMessage('');
    };

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>
          Открыть форму
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Контактная форма"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
              required
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />

            <Textarea
              label="Сообщение"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ваше сообщение..."
              rows={4}
              required
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-default)]">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsOpen(false)}
              >
                Отмена
              </Button>
              <Button type="submit">
                Отправить
              </Button>
            </div>
          </form>
        </Modal>
      </>
    );
  },
};

export const NestedContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>
          Открыть с вложенным контентом
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Модальное окно со сложным контентом"
          size="xl"
        >
          <div className="space-y-6">
            {/* Section 1 */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-[var(--color-text-primary)]">
                Раздел 1: Информация
              </h4>
              <div className="bg-[var(--color-bg-tertiary)] p-4 rounded-lg">
                <p className="text-[var(--color-text-secondary)]">
                  Это первый раздел с дополнительной информацией.
                  Модальное окно поддерживает прокрутку при большом объеме контента.
                </p>
              </div>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-[var(--color-text-primary)]">
                Раздел 2: Настройки
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Параметр 1"
                  placeholder="Значение 1"
                />
                <Input
                  label="Параметр 2"
                  placeholder="Значение 2"
                />
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-[var(--color-text-primary)]">
                Раздел 3: Дополнительный текст
              </h4>
              <Textarea
                placeholder="Введите дополнительную информацию..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-default)]">
              <Button variant="secondary" onClick={() => setIsOpen(false)}>
                Отмена
              </Button>
              <Button onClick={() => alert('Сохранено!')}>
                Сохранить
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  },
};

export const AccessibilityDemo: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>
          Демонстрация доступности
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Демонстрация доступности"
        >
          <div className="space-y-4">
            <div className="bg-[var(--color-bg-tertiary)] p-4 rounded-lg">
              <h4 className="font-medium text-[var(--color-text-primary)] mb-2">
                Клавиатурная навигация:
              </h4>
              <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
                <li>• <kbd className="bg-[var(--color-bg-primary)] px-1 py-0.5 rounded text-xs">Tab</kbd> - переход к следующему элементу</li>
                <li>• <kbd className="bg-[var(--color-bg-primary)] px-1 py-0.5 rounded text-xs">Shift + Tab</kbd> - переход к предыдущему элементу</li>
                <li>• <kbd className="bg-[var(--color-bg-primary)] px-1 py-0.5 rounded text-xs">Escape</kbd> - закрытие модального окна</li>
              </ul>
            </div>

            <p className="text-[var(--color-text-secondary)]">
              Попробуйте использовать клавиатуру для навигации между элементами.
              Фокус останется внутри модального окна благодаря focus trap.
            </p>

            <div className="flex gap-3">
              <Input placeholder="Поле ввода 1" />
              <Input placeholder="Поле ввода 2" />
            </div>

            <Textarea placeholder="Многострочный текст" rows={3} />

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-default)]">
              <Button variant="secondary" onClick={() => setIsOpen(false)}>
                Закрыть
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  },
};
