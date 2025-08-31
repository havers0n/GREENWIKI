import React from 'react';
import { Input as TextInput, Typography as Text } from '@my-forum/ui';

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
      <Text variant="small" className="font-medium mb-2">{label}</Text>

      {/* Padding */}
      <Text variant="small" className="text-gray-600 mb-2">Внутренние отступы (Padding)</Text>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <TextInput
          label="Верх"
          placeholder="0px"
          value={value.paddingTop || ''}
          onChange={(e) => handleChange('paddingTop', e.target.value)}
        />
        <TextInput
          label="Право"
          placeholder="0px"
          value={value.paddingRight || ''}
          onChange={(e) => handleChange('paddingRight', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <TextInput
          label="Низ"
          placeholder="0px"
          value={value.paddingBottom || ''}
          onChange={(e) => handleChange('paddingBottom', e.target.value)}
        />
        <TextInput
          label="Лево"
          placeholder="0px"
          value={value.paddingLeft || ''}
          onChange={(e) => handleChange('paddingLeft', e.target.value)}
        />
      </div>

      {/* Margin */}
      <Text variant="small" className="text-gray-600 mb-2">Внешние отступы (Margin)</Text>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <TextInput
          label="Верх"
          placeholder="0px"
          value={value.marginTop || ''}
          onChange={(e) => handleChange('marginTop', e.target.value)}
        />
        <TextInput
          label="Право"
          placeholder="0px"
          value={value.marginRight || ''}
          onChange={(e) => handleChange('marginRight', e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextInput
          label="Низ"
          placeholder="0px"
          value={value.marginBottom || ''}
          onChange={(e) => handleChange('marginBottom', e.target.value)}
        />
        <TextInput
          label="Лево"
          placeholder="0px"
          value={value.marginLeft || ''}
          onChange={(e) => handleChange('marginLeft', e.target.value)}
        />
      </div>
    </div>
  );
};
