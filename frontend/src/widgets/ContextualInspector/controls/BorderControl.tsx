import React from 'react';
import { Input as TextInput, Select, Typography as Text } from '@my-forum/ui';

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
      <Text variant="body-sm" className="font-medium mb-2">{label}</Text>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <TextInput
          label="Толщина"
          placeholder="1px"
          value={value.width || ''}
          onChange={(e) => handleChange('width', e.target.value)}
        />
        <Select
          label="Стиль"
          data={borderStyles}
          value={value.style || ''}
          onChange={(newValue) => handleChange('style', newValue || '')}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <TextInput
          label="Цвет"
          placeholder="#000000"
          value={value.color || ''}
          onChange={(e) => handleChange('color', e.target.value)}
        />
        <TextInput
          label="Скругление"
          placeholder="0px"
          value={value.radius || ''}
          onChange={(e) => handleChange('radius', e.target.value)}
        />
      </div>
    </div>
  );
};
