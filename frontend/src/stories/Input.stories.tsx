import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@my-forum/ui';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  args: { placeholder: 'Enter text', label: 'Label' },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};
export const WithError: Story = { args: { error: 'Validation error' } };
export const WithHint: Story = { args: { hint: 'Some hint' } };
export const Disabled: Story = { args: { disabled: true } };
