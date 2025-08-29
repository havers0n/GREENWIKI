import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from '../organisms/DataTable';
import { Button } from '../atoms/Button';
import { ThemeProvider } from '../contexts/ThemeContext';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

const sampleData: User[] = [
  {
    id: 1,
    name: 'Иван Петров',
    email: 'ivan@example.com',
    role: 'Администратор',
    status: 'active',
    createdAt: '2023-01-15',
  },
  {
    id: 2,
    name: 'Мария Сидорова',
    email: 'maria@example.com',
    role: 'Модератор',
    status: 'active',
    createdAt: '2023-02-20',
  },
  {
    id: 3,
    name: 'Алексей Иванов',
    email: 'alex@example.com',
    role: 'Пользователь',
    status: 'inactive',
    createdAt: '2023-03-10',
  },
  {
    id: 4,
    name: 'Елена Козлова',
    email: 'elena@example.com',
    role: 'Модератор',
    status: 'active',
    createdAt: '2023-04-05',
  },
  {
    id: 5,
    name: 'Дмитрий Николаев',
    email: 'dmitry@example.com',
    role: 'Пользователь',
    status: 'inactive',
    createdAt: '2023-05-12',
  },
];

const columns = [
  {
    key: 'name' as keyof User,
    header: 'Имя',
    sortable: true,
  },
  {
    key: 'email' as keyof User,
    header: 'Email',
    sortable: true,
  },
  {
    key: 'role' as keyof User,
    header: 'Роль',
    sortable: true,
  },
  {
    key: 'status' as keyof User,
    header: 'Статус',
    sortable: true,
    render: (status: string) => (
      <span
        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          status === 'active'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}
      >
        {status === 'active' ? 'Активен' : 'Неактивен'}
      </span>
    ),
  },
  {
    key: 'createdAt' as keyof User,
    header: 'Дата создания',
    sortable: true,
    render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
  },
];

const meta: Meta<typeof DataTable> = {
  title: 'Organisms/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Компонент таблицы данных с сортировкой, поиском, пагинацией и выбором строк.',
      },
    },
  },
  argTypes: {
    loading: {
      control: 'boolean',
      description: 'Показывать состояние загрузки',
    },
    searchable: {
      control: 'boolean',
      description: 'Включить поиск',
    },
    sortable: {
      control: 'boolean',
      description: 'Включить сортировку',
    },
    selectable: {
      control: 'boolean',
      description: 'Включить выбор строк',
    },
  },
  // decorators: [
  //   (Story) => (
  //     <ThemeProvider>
  //       <div className="p-4">
  //         <Story />
  //       </div>
  //     </ThemeProvider>
  //   ),
  // ],
};

export default meta;
type Story = StoryObj<typeof DataTable>;

export const Basic: Story = {
  args: {
    data: sampleData,
    columns,
    searchable: true,
    sortable: true,
  },
};

export const WithSelection: Story = {
  args: {
    data: sampleData,
    columns,
    searchable: true,
    sortable: true,
    selectable: true,
    actions: [
      {
        label: 'Редактировать',
        onClick: (rows) => console.log('Edit:', rows),
        variant: 'secondary',
      },
      {
        label: 'Удалить',
        onClick: (rows) => console.log('Delete:', rows),
        variant: 'danger',
      },
    ],
  },
};

export const WithPagination: Story = {
  args: {
    data: sampleData,
    columns,
    searchable: true,
    sortable: true,
    pagination: {
      currentPage: 1,
      totalPages: 5,
      onPageChange: (page) => console.log('Page changed:', page),
      pageSize: 3,
      onPageSizeChange: (size) => console.log('Page size changed:', size),
    },
  },
};

export const Loading: Story = {
  args: {
    data: sampleData,
    columns,
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    columns,
    searchable: true,
    emptyMessage: 'Пользователи не найдены',
  },
};

export const CustomActions: Story = {
  args: {
    data: sampleData.slice(0, 3),
    columns,
    selectable: true,
    actions: [
      {
        label: 'Активировать',
        onClick: (rows) => console.log('Activate:', rows),
        variant: 'primary',
        icon: <span>✓</span>,
      },
      {
        label: 'Заблокировать',
        onClick: (rows) => console.log('Block:', rows),
        variant: 'danger',
        icon: <span>🚫</span>,
      },
      {
        label: 'Экспорт',
        onClick: (rows) => console.log('Export:', rows),
        variant: 'secondary',
        icon: <span>📄</span>,
      },
    ],
  },
};
