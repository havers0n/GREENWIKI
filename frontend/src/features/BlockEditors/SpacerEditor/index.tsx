import React from 'react';
import { Select, Input } from 'shared/ui/atoms';

interface SpacerData {
  height: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  customHeight?: number;
}

interface SpacerEditorProps {
  data: SpacerData;
  onChange: (data: SpacerData) => void;
}

const SpacerEditor: React.FC<SpacerEditorProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <Select
        label="Размер отступа"
        value={data.height}
        onChange={(e) => onChange({ ...data, height: e.target.value as SpacerData['height'] })}
      >
        <option value="sm">Маленький (16px)</option>
        <option value="md">Средний (32px)</option>
        <option value="lg">Большой (64px)</option>
        <option value="xl">Очень большой (96px)</option>
        <option value="custom">Пользовательский</option>
      </Select>
      
      {data.height === 'custom' && (
        <Input
          label="Высота в пикселях"
          type="number"
          min="1"
          max="500"
          value={data.customHeight?.toString() || '32'}
          onChange={(e) => onChange({ 
            ...data, 
            customHeight: parseInt(e.target.value) || 32 
          })}
          placeholder="32"
        />
      )}
      
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded p-2">
        <strong>Назначение:</strong> Используйте отступы для создания визуального пространства между блоками контента.
      </div>
    </div>
  );
};

export default SpacerEditor;
