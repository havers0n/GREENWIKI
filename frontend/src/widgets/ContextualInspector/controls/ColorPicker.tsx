import React from 'react';
import { EnhancedColorPicker, Typography as Text } from '@my-forum/ui';

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
      <Text variant="small" className="font-medium mb-2">{label}</Text>
      <EnhancedColorPicker
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
};
