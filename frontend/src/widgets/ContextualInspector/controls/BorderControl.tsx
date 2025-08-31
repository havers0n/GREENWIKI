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
      <Text variant="small" className="font-medium mb-2">{label}</Text>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <TextInput
          label="Толщина"
          placeholder="1px"
          value={value.width || ''}
          onChange={(e) => handleChange('width', e.target.value)}
        />
        <Select
          label="Стиль"
          value={value.style || ''}
          onChange={(e) => handleChange('style', e.target.value)}
        >
          {borderStyles.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </Select>
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
