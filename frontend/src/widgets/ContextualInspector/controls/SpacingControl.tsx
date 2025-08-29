import React from 'react';
import { TextInput, Group, Text } from '@mantine/core';

interface SpacingControlProps {
  label?: string;
  value?: {
    paddingTop?: string;
    paddingRight?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    marginTop?: string;
    marginRight?: string;
    marginBottom?: string;
    marginLeft?: string;
  };
  onChange: (value: {
    paddingTop?: string;
    paddingRight?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    marginTop?: string;
    marginRight?: string;
    marginBottom?: string;
    marginLeft?: string;
  }) => void;
}

export const SpacingControl: React.FC<SpacingControlProps> = ({
  label = 'Отступы',
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

      {/* Padding */}
      <Text size="xs" c="dimmed" mb="xs">Внутренние отступы (Padding)</Text>
      <Group grow mb="md">
        <TextInput
          label="Верх"
          placeholder="0px"
          value={value.paddingTop || ''}
          onChange={(e) => handleChange('paddingTop', e.target.value)}
          size="xs"
        />
        <TextInput
          label="Право"
          placeholder="0px"
          value={value.paddingRight || ''}
          onChange={(e) => handleChange('paddingRight', e.target.value)}
          size="xs"
        />
      </Group>
      <Group grow mb="md">
        <TextInput
          label="Низ"
          placeholder="0px"
          value={value.paddingBottom || ''}
          onChange={(e) => handleChange('paddingBottom', e.target.value)}
          size="xs"
        />
        <TextInput
          label="Лево"
          placeholder="0px"
          value={value.paddingLeft || ''}
          onChange={(e) => handleChange('paddingLeft', e.target.value)}
          size="xs"
        />
      </Group>

      {/* Margin */}
      <Text size="xs" c="dimmed" mb="xs">Внешние отступы (Margin)</Text>
      <Group grow mb="md">
        <TextInput
          label="Верх"
          placeholder="0px"
          value={value.marginTop || ''}
          onChange={(e) => handleChange('marginTop', e.target.value)}
          size="xs"
        />
        <TextInput
          label="Право"
          placeholder="0px"
          value={value.marginRight || ''}
          onChange={(e) => handleChange('marginRight', e.target.value)}
          size="xs"
        />
      </Group>
      <Group grow>
        <TextInput
          label="Низ"
          placeholder="0px"
          value={value.marginBottom || ''}
          onChange={(e) => handleChange('marginBottom', e.target.value)}
          size="xs"
        />
        <TextInput
          label="Лево"
          placeholder="0px"
          value={value.marginLeft || ''}
          onChange={(e) => handleChange('marginLeft', e.target.value)}
          size="xs"
        />
      </Group>
    </div>
  );
};
