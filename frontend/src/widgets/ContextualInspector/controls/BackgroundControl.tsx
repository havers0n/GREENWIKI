import React from 'react';
import { Input as TextInput, Select, Typography as Text } from '@my-forum/ui';

interface BackgroundControlProps {
  label?: string;
  value?: {
    type?: 'color' | 'gradient' | 'image';
    color?: string;
    gradientStart?: string;
    gradientEnd?: string;
    imageUrl?: string;
  };
  onChange: (value: {
    type?: 'color' | 'gradient' | 'image';
    color?: string;
    gradientStart?: string;
    gradientEnd?: string;
    imageUrl?: string;
  }) => void;
}

const backgroundTypes = [
  { value: 'color', label: 'Цвет' },
  { value: 'gradient', label: 'Градиент' },
  { value: 'image', label: 'Изображение' },
];

export const BackgroundControl: React.FC<BackgroundControlProps> = ({
  label = 'Фон',
  value = {},
  onChange,
}) => {
  const handleChange = (field: string, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  const handleTypeChange = (newType: string) => {
    onChange({
      ...value,
      type: newType as 'color' | 'gradient' | 'image',
    });
  };

  return (
    <div>
      <Text variant="body-sm" className="font-medium mb-2">{label}</Text>

      <Select
        label="Тип фона"
        data={backgroundTypes}
        value={value.type || 'color'}
        onChange={handleTypeChange}
        size="xs"
        mb="md"
      />

      {value.type === 'color' && (
        <TextInput
          label="Цвет фона"
          placeholder="#ffffff"
          value={value.color || ''}
          onChange={(e) => handleChange('color', e.target.value)}
          size="xs"
        />
      )}

      {value.type === 'gradient' && (
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="Начальный цвет"
            placeholder="#ffffff"
            value={value.gradientStart || ''}
            onChange={(e) => handleChange('gradientStart', e.target.value)}
          />
          <TextInput
            label="Конечный цвет"
            placeholder="#000000"
            value={value.gradientEnd || ''}
            onChange={(e) => handleChange('gradientEnd', e.target.value)}
          />
        </div>
      )}

      {value.type === 'image' && (
        <TextInput
          label="URL изображения"
          placeholder="https://example.com/image.jpg"
          value={value.imageUrl || ''}
          onChange={(e) => handleChange('imageUrl', e.target.value)}
          size="xs"
        />
      )}
    </div>
  );
};
