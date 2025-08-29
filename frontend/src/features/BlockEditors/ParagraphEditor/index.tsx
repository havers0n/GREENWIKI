import React from 'react';
import { Textarea } from 'shared/ui/atoms';

interface ParagraphData {
  text: string;
}

interface ParagraphEditorProps {
  data: ParagraphData;
  onChange: (data: ParagraphData) => void;
}

const ParagraphEditor: React.FC<ParagraphEditorProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <Textarea
        label="Текст параграфа"
        rows={8}
        value={data.text}
        onChange={(e) => onChange({ ...data, text: e.target.value })}
        placeholder="Введите текст параграфа. Поддерживается базовый Markdown:
**жирный текст**
*курсив*
`код`"
      />
      
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded p-2">
        <strong>Поддерживаемая разметка:</strong>
        <ul className="mt-1 space-y-1">
          <li><code>**текст**</code> — жирный шрифт</li>
          <li><code>*текст*</code> — курсив</li>
          <li><code>`код`</code> — моноширинный шрифт</li>
        </ul>
      </div>
    </div>
  );
};

export default ParagraphEditor;
