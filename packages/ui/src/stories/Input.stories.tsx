import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Input, InputSize } from '../atoms/Input';
import { ThemeProvider } from '../contexts/ThemeContext';

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
        Универсальный компонент поля ввода с полной поддержкой дизайн-системы.

        ## Особенности:
        - Полная поддержка всех состояний (default, focus, error/invalid, disabled)
        - Использование дизайн-токенов из tokens.json
        - Поддержка label, hint и error сообщений
        - Полная доступность (WCAG 2.1 AA)
        - Поддержка required полей с визуальным индикатором
        - Композитная архитектура с правильной связью элементов
        `,
      },
    },
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Размер поля ввода',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    label: {
      control: 'text',
      description: 'Текст метки над полем',
    },
    hint: {
      control: 'text',
      description: 'Подсказка под полем (показывается если нет ошибки)',
    },
    error: {
      control: 'text',
      description: 'Текст ошибки (заменяет подсказку)',
    },
    invalid: {
      control: 'boolean',
      description: 'Альтернативный способ показать состояние ошибки',
    },
    required: {
      control: 'boolean',
      description: 'Обязательное поле (добавляет * к метке)',
    },
    disabled: {
      control: 'boolean',
      description: 'Отключить поле ввода',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder текст',
    },
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: 'Тип поля ввода',
    },
  },

};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'user@example.com',
    size: 'md',
  },
};

export const WithHint: Story = {
  args: {
    label: 'Пароль',
    type: 'password',
    hint: 'Минимум 8 символов',
    placeholder: 'Введите пароль',
    size: 'md',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    type: 'email',
    error: 'Некорректный формат email',
    placeholder: 'user@example.com',
    size: 'md',
  },
};

export const Required: Story = {
  args: {
    label: 'Имя пользователя',
    type: 'text',
    required: true,
    placeholder: 'Введите имя',
    size: 'md',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Отключенное поле',
    type: 'text',
    disabled: true,
    placeholder: 'Это поле отключено',
    size: 'md',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <Input
        label="Small Size"
        size="sm"
        placeholder="Small input"
      />
      <Input
        label="Medium Size (default)"
        size="md"
        placeholder="Medium input"
      />
      <Input
        label="Large Size"
        size="lg"
        placeholder="Large input"
      />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <Input
        label="Default State"
        placeholder="Normal input"
      />
      <Input
        label="Focus State"
        placeholder="Click here to see focus"
        autoFocus
      />
      <Input
        label="Error State"
        placeholder="Error input"
        error="This field is required"
      />
      <Input
        label="Disabled State"
        placeholder="Disabled input"
        disabled
      />
    </div>
  ),
};

export const FormExample: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateField = (name: string, value: string) => {
      const newErrors = { ...errors };

      switch (name) {
        case 'name':
          if (!value.trim()) {
            newErrors.name = 'Имя обязательно';
          } else if (value.trim().length < 2) {
            newErrors.name = 'Имя должно содержать минимум 2 символа';
          } else {
            delete newErrors.name;
          }
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!value.trim()) {
            newErrors.email = 'Email обязателен';
          } else if (!emailRegex.test(value)) {
            newErrors.email = 'Некорректный формат email';
          } else {
            delete newErrors.email;
          }
          break;
        case 'password':
          if (!value) {
            newErrors.password = 'Пароль обязателен';
          } else if (value.length < 8) {
            newErrors.password = 'Пароль должен содержать минимум 8 символов';
          } else {
            delete newErrors.password;
          }
          break;
      }

      setErrors(newErrors);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      validateField(name, value);
    };

    return (
      <div className="max-w-md space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Регистрация
        </h3>

        <Input
          label="Имя"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          hint="Ваше полное имя"
          placeholder="Иван Иванов"
        />

        <Input
          label="Email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          hint="Мы будем отправлять вам уведомления"
          placeholder="user@example.com"
        />

        <Input
          label="Пароль"
          name="password"
          type="password"
          required
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          hint="Используйте буквы, цифры и символы"
          placeholder="••••••••"
        />

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Поля со звездочкой (*) обязательны для заполнения
        </div>
      </div>
    );
  },
};

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <Input
        label="Имя пользователя"
        type="text"
        required
        hint="Ваше публичное имя"
        placeholder="johndoe"
        aria-describedby="username-help"
      />

      <Input
        label="Дата рождения"
        type="date"
        hint="Нужна для верификации возраста"
        placeholder="YYYY-MM-DD"
      />

      <Input
        label="Телефон"
        type="tel"
        hint="В международном формате"
        placeholder="+7 (999) 123-45-67"
      />
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    label: 'Interactive Input',
    type: 'text',
    placeholder: 'Type something...',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        story: 'Интерактивное поле ввода для тестирования всех состояний.',
      },
    },
  },
};
