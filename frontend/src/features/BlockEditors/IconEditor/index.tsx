import React from 'react';
import { Select, Input } from '@my-forum/ui';

interface IconData {
  icon: string;
  size?: 'small' | 'medium' | 'large' | 'xl';
  color?: string;
}

interface IconEditorProps {
  data: IconData;
  onChange: (data: IconData) => void;
}

const IconEditor: React.FC<IconEditorProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <Input
        label="Иконка (emoji или символ)"
        value={data.icon || ''}
        onChange={(e) => onChange({ ...data, icon: e.target.value })}
        placeholder="🚀 или ⭐"
      />

      <Select
        label="Размер"
        value={data.size || 'medium'}
        onChange={(value) => onChange({ ...data, size: value })}
        options={[
          { value: 'small', label: 'Маленький' },
          { value: 'medium', label: 'Средний' },
          { value: 'large', label: 'Большой' },
          { value: 'xl', label: 'Очень большой' }
        ]}
      />

      <Input
        label="Цвет"
        type="color"
        value={data.color || '#000000'}
        onChange={(e) => onChange({ ...data, color: e.target.value })}
      />
    </div>
  );
};

export default IconEditor;
