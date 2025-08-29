import type { Meta, StoryObj } from '@storybook/react';
import { Modal, type ModalProps } from '@my-forum/ui';

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
};
export default meta;

type Story = StoryObj<typeof Modal>;

export const Basic: Story = {
  render: (args: ModalProps) => (
    <Modal {...args} title="Title" isOpen onClose={() => {}}>
      <div>Content</div>
    </Modal>
  ),
};
