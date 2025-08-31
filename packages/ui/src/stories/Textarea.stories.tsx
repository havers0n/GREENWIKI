import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '../atoms/Textarea';
import { ThemeProvider } from '../contexts/ThemeContext';

const meta: Meta<typeof Textarea> = {
  title: 'Atoms/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
        Универсальный компонент многострочного текстового поля с полной поддержкой дизайн-системы.

        ## Особенности:
        - Полная поддержка всех состояний (default, focus, error/invalid, disabled)
        - Использование дизайн-токенов из tokens.json
        - Поддержка label, hint и error сообщений
        - Полная доступность (WCAG 2.1 AA)
        - Поддержка required полей с визуальным индикатором
        - Композитная архитектура с правильной связью элементов
        - Только вертикальное изменение размера (resize: vertical)

        ## Использование:
        \`\`\`tsx
        <Textarea
          label="Описание"
          hint="Введите подробное описание"
          rows={6}
          placeholder="Начните писать здесь..."
        />
        \`\`\`
        `,
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Текст метки над полем',
      table: {
        defaultValue: { summary: 'undefined' },
      },
    },
    hint: {
      control: 'text',
      description: 'Подсказка под полем (показывается если нет ошибки)',
      table: {
        defaultValue: { summary: 'undefined' },
      },
    },
    error: {
      control: 'text',
      description: 'Текст ошибки (заменяет подсказку и добавляет визуальную индикацию)',
      table: {
        defaultValue: { summary: 'undefined' },
      },
    },
    invalid: {
      control: 'boolean',
      description: 'Альтернативный способ показать состояние ошибки',
      table: {
        defaultValue: { summary: false },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Отключает поле ввода',
      table: {
        defaultValue: { summary: false },
      },
    },
    required: {
      control: 'boolean',
      description: 'Отмечает поле как обязательное (добавляет *)',
      table: {
        defaultValue: { summary: false },
      },
    },
    rows: {
      control: { type: 'number', min: 1, max: 20 },
      description: 'Количество видимых строк текста',
      table: {
        defaultValue: { summary: 6 },
      },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder текст',
      table: {
        defaultValue: { summary: 'undefined' },
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
type Story = StoryObj<typeof Textarea>;

// Base Textarea Stories
export const Default: Story = {
  args: {
    label: 'Описание',
    placeholder: 'Введите текст здесь...',
    rows: 4,
  },
};

export const WithHint: Story = {
  args: {
    label: 'Комментарий',
    hint: 'Напишите подробный комментарий о вашем решении',
    placeholder: 'Ваш комментарий...',
    rows: 4,
  },
};

export const WithError: Story = {
  args: {
    label: 'Описание ошибки',
    error: 'Описание не может быть пустым и должно содержать минимум 10 символов',
    placeholder: 'Опишите проблему...',
    rows: 4,
    invalid: true,
  },
};

export const Required: Story = {
  args: {
    label: 'Обязательное поле',
    hint: 'Это поле обязательно для заполнения',
    placeholder: 'Введите текст...',
    required: true,
    rows: 3,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Отключенное поле',
    placeholder: 'Это поле отключено',
    value: 'Некоторый текст',
    disabled: true,
    rows: 3,
  },
};

export const WithValue: Story = {
  args: {
    label: 'Поле с текстом',
    value: `Это пример многострочного текста.
Вторая строка текста.
Третья строка с дополнительной информацией.

И еще одна пустая строка.`,
    rows: 6,
  },
};

export const DifferentRows: Story = {
  render: (args) => (
    <div className="space-y-6">
      <Textarea {...args} label="Маленькое поле" rows={2} placeholder="Короткий текст" />
      <Textarea {...args} label="Среднее поле" rows={4} placeholder="Средний текст" />
      <Textarea {...args} label="Большое поле" rows={8} placeholder="Длинный текст" />
    </div>
  ),
  args: {
    hint: 'Разные размеры полей для разных сценариев использования',
  },
};

export const States: Story = {
  render: () => (
    <div className="space-y-6">
      <Textarea
        label="Обычное состояние"
        hint="Это обычное поле без ошибок"
        placeholder="Введите текст..."
        rows={3}
      />
      <Textarea
        label="Поле с ошибкой"
        error="Это поле содержит ошибку валидации"
        placeholder="Введите текст..."
        rows={3}
      />
      <Textarea
        label="Отключенное поле"
        placeholder="Это поле отключено"
        value="Некоторый текст"
        disabled
        rows={3}
      />
      <Textarea
        label="Обязательное поле"
        hint="Это поле обязательно для заполнения"
        placeholder="Введите текст..."
        required
        rows={3}
      />
    </div>
  ),
};

// Real-world usage examples
const ContactFormExample = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Имя обязательно';
    if (!email.trim()) newErrors.email = 'Email обязателен';
    if (!message.trim()) newErrors.message = 'Сообщение обязательно';
    else if (message.length < 10) newErrors.message = 'Сообщение должно содержать минимум 10 символов';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert('Форма отправлена успешно!');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h3 className="text-lg font-medium">Контактная форма</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          label="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          placeholder="Ваше имя"
          rows={1}
          required
        />
        <Textarea
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="your@email.com"
          rows={1}
          required
        />
        <Textarea
          label="Сообщение"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          error={errors.message}
          hint="Опишите вашу проблему или вопрос"
          placeholder="Расскажите подробнее..."
          rows={5}
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Отправить
        </button>
      </form>
    </div>
  );
};

export const ContactForm: StoryObj<typeof Textarea> = {
  render: () => <ContactFormExample />,
};

const ContentEditorExample = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h3 className="text-lg font-medium">Редактор контента</h3>
      <div className="space-y-4">
        <Textarea
          label="Заголовок"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Введите заголовок статьи"
          rows={1}
          required
        />
        <Textarea
          label="Краткое описание"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          hint="Короткое описание для превью (рекомендуется 100-200 символов)"
          placeholder="Краткое описание..."
          rows={2}
        />
        <Textarea
          label="Содержимое"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          hint="Полный текст статьи. Поддерживается Markdown разметка"
          placeholder={`# Заголовок статьи

Это основное содержимое вашей статьи.

## Подзаголовок

- Список элементов
- Еще один элемент

**Жирный текст** и *курсивный текст*.

[Ссылка](https://example.com)`}
          rows={12}
          required
        />
      </div>
    </div>
  );
};

export const ContentEditor: StoryObj<typeof Textarea> = {
  render: () => <ContentEditorExample />,
};

// Accessibility demonstration
const AccessibilityExample = () => {
  const [value, setValue] = useState('');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Пример доступности</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Используйте клавиатуру для навигации: Tab для перехода к полю, Enter для редактирования.
        Экранные читалки корректно прочитают все метки и описания.
      </p>

      <Textarea
        label="Поле с полной доступностью"
        hint="Это поле полностью соответствует WCAG 2.1 AA"
        placeholder="Введите текст..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        required
      />

      <Textarea
        label="Поле с ошибкой"
        error="Это поле содержит ошибку валидации"
        placeholder="Исправьте ошибку..."
        rows={3}
      />
    </div>
  );
};

export const AccessibilityDemo: StoryObj<typeof Textarea> = {
  render: () => <AccessibilityExample />,
};
