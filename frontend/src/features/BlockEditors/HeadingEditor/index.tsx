import React from 'react';
import { Input, Select } from '@my-forum/ui';

interface HeadingData {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  align: 'left' | 'center' | 'right';
}

interface HeadingEditorProps {
  data: HeadingData;
  onChange: (data: HeadingData) => void;
}

const HeadingEditor: React.FC<HeadingEditorProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <Input
        label="Текст заголовка"
        value={data.text}
        onChange={(e) => onChange({ ...data, text: e.target.value })}
        placeholder="Введите текст заголовка"
      />
      
      <Select
        label="Уровень заголовка"
        value={data.level.toString()}
        onChange={(e) => onChange({ ...data, level: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 })}
      >
        <option value="1">H1 - Главный заголовок</option>
        <option value="2">H2 - Заголовок раздела</option>
        <option value="3">H3 - Подзаголовок</option>
        <option value="4">H4 - Малый заголовок</option>
        <option value="5">H5 - Мини заголовок</option>
        <option value="6">H6 - Микро заголовок</option>
      </Select>
      
      <Select
        label="Выравнивание"
        value={data.align}
        onChange={(e) => onChange({ ...data, align: e.target.value as 'left' | 'center' | 'right' })}
      >
        <option value="left">По левому краю</option>
        <option value="center">По центру</option>
        <option value="right">По правому краю</option>
      </Select>
    </div>
  );
};

export default HeadingEditor;
