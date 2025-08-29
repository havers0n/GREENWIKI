import React from 'react';
import { Input, Select } from 'shared/ui/atoms';

interface ButtonData {
  text: string;
  link: string;
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
}

interface ButtonEditorProps {
  data: ButtonData;
  onChange: (data: ButtonData) => void;
}

const ButtonEditor: React.FC<ButtonEditorProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <Input
        label="Текст кнопки"
        value={data.text}
        onChange={(e) => onChange({ ...data, text: e.target.value })}
        placeholder="Например: Подробнее"
      />
      
      <Input
        label="Ссылка"
        value={data.link}
        onChange={(e) => onChange({ ...data, link: e.target.value })}
        placeholder="https://example.com или /page"
        type="url"
      />
      
      <Select
        label="Стиль кнопки"
        value={data.variant}
        onChange={(e) => onChange({ ...data, variant: e.target.value as ButtonData['variant'] })}
      >
        <option value="primary">Основная (Primary)</option>
        <option value="secondary">Вторичная (Secondary)</option>
        <option value="danger">Опасная (Danger)</option>
        <option value="ghost">Прозрачная (Ghost)</option>
      </Select>
      
      <Select
        label="Размер"
        value={data.size}
        onChange={(e) => onChange({ ...data, size: e.target.value as ButtonData['size'] })}
      >
        <option value="sm">Маленький</option>
        <option value="md">Средний</option>
        <option value="lg">Большой</option>
      </Select>
    </div>
  );
};

export default ButtonEditor;
