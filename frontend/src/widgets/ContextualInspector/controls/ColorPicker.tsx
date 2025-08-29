import React from 'react';
import { ColorInput, Group, Text } from '@mantine/core';

interface ColorPickerProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label = 'Цвет',
  value = '',
  onChange,
  placeholder = '#000000',
}) => {
  return (
    <div>
      <Text size="sm" fw={500} mb="xs">{label}</Text>
      <ColorInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        size="sm"
        format="hex"
      />
    </div>
  );
};
