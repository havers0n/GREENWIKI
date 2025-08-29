import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

const Box: React.FC = () => (
  <div style={{ padding: 16, background: '#eee' }}>Sample</div>
)

const meta: Meta<typeof Box> = { title: 'Sample/Box', component: Box }
export default meta

type Story = StoryObj<typeof Box>
export const Basic: Story = {}
