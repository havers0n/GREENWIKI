import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../atoms/Button';
import { ThemeProvider } from '../contexts/ThemeContext';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Основной компонент кнопки с различными вариантами и размерами.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger', 'ghost'],
      description: 'Вариант стиля кнопки',
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Размер кнопки',
    },
    loading: {
      control: 'boolean',
      description: 'Показывать состояние загрузки',
    },
    disabled: {
      control: 'boolean',
      description: 'Отключить кнопку',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Растянуть кнопку на всю ширину',
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
    children: 'Опасная кнопка',
    variant: 'danger',
    size: 'md',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Прозрачная кнопка',
    variant: 'ghost',
    size: 'md',
  },
};

export const Loading: Story = {
  args: {
    children: 'Загрузка...',
    variant: 'primary',
    size: 'md',
    loading: true,
  },
};

export const WithIcons: Story = {
  args: {
    children: 'С иконками',
    variant: 'primary',
    size: 'md',
    leftIcon: <span>←</span>,
    rightIcon: <span>→</span>,
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="xs">XS</Button>
      <Button size="sm">SM</Button>
      <Button size="md">MD</Button>
      <Button size="lg">LG</Button>
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
