import React from 'react';
import { TextInput, Select, Group, Text } from '@mantine/core';

interface BorderControlProps {
  label?: string;
  value?: {
    width?: string;
    style?: string;
    color?: string;
    radius?: string;
  };
  onChange: (value: {
    width?: string;
    style?: string;
    color?: string;
    radius?: string;
  }) => void;
}

const borderStyles = [
  { value: 'none', label: 'Нет' },
  { value: 'solid', label: 'Сплошная' },
  { value: 'dashed', label: 'Пунктирная' },
  { value: 'dotted', label: 'Точечная' },
  { value: 'double', label: 'Двойная' },
];

export const BorderControl: React.FC<BorderControlProps> = ({
  label = 'Рамка',
  value = {},
  onChange,
}) => {
  const handleChange = (field: string, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  return (
    <div>
      <Text size="sm" fw={500} mb="xs">{label}</Text>

      <Group grow mb="md">
        <TextInput
          label="Толщина"
          placeholder="1px"
          value={value.width || ''}
          onChange={(e) => handleChange('width', e.target.value)}
          size="xs"
        />
        <Select
          label="Стиль"
          placeholder="Выберите стиль"
          data={borderStyles}
          value={value.style || ''}
          onChange={(newValue) => handleChange('style', newValue || '')}
          size="xs"
        />
      </Group>

      <Group grow mb="md">
        <TextInput
          label="Цвет"
          placeholder="#000000"
          value={value.color || ''}
          onChange={(e) => handleChange('color', e.target.value)}
          size="xs"
        />
        <TextInput
          label="Скругление"
          placeholder="0px"
          value={value.radius || ''}
          onChange={(e) => handleChange('radius', e.target.value)}
          size="xs"
        />
      </Group>
    </div>
  );
};
