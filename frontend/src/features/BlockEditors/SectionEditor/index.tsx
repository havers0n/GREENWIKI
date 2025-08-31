import React from 'react';
import { Select, Input } from '@my-forum/ui';

interface SectionData {
  backgroundColor?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  maxWidth?: string;
}

interface SectionEditorProps {
  data: SectionData;
  onChange: (data: SectionData) => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <Input
        label="Цвет фона"
        type="color"
        value={data.backgroundColor || '#ffffff'}
        onChange={(e) => onChange({ ...data, backgroundColor: e.target.value })}
      />

      <Select
        label="Внутренние отступы"
        value={data.padding || 'medium'}
        onChange={(value) => onChange({ ...data, padding: value })}
        options={[
          { value: 'none', label: 'Без отступов' },
          { value: 'small', label: 'Маленькие' },
          { value: 'medium', label: 'Средние' },
          { value: 'large', label: 'Большие' }
        ]}
      />

      <Input
        label="Максимальная ширина"
        value={data.maxWidth || '1200px'}
        onChange={(e) => onChange({ ...data, maxWidth: e.target.value })}
        placeholder="1200px"
      />
    </div>
  );
};

export default SectionEditor;
