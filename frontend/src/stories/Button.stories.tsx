import type { Meta, StoryObj } from '@storybook/react';
import { Button, ButtonVariant, ButtonSize } from '@my-forum/ui';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  args: { children: 'Button' },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: ButtonVariant.Primary } };
export const Secondary: Story = { args: { variant: ButtonVariant.Secondary } };
export const Danger: Story = { args: { variant: ButtonVariant.Danger } };
export const Ghost: Story = { args: { variant: ButtonVariant.Ghost } };
export const Small: Story = { args: { size: ButtonSize.Sm } };
export const Large: Story = { args: { size: ButtonSize.Lg } };
