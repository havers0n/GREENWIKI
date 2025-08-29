import React from 'react';
import type { BlockContentEditorProps } from '../types';

/**
 * Компонент для редактирования контента блока
 * Содержит специфический редактор для типа блока
 */
const BlockContentEditor: React.FC<BlockContentEditorProps> = ({
  block,
  spec,
  data,
  onBlockChange
}) => {
  const Editor = spec.Editor as React.FC<{ data: unknown; onChange: (d: unknown) => void }>;

  if (!Editor) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <div className="text-2xl mb-2">📝</div>
        <p className="text-sm">Редактор для этого типа блока недоступен</p>
      </div>
    );
  }

  const handleDataChange = (newData: unknown) => {
    try {
      // Валидация данных если есть схема
      if (spec.schema) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = (spec.schema as any).safeParse(newData);
        if (!result.success) {
          console.warn('Validation error:', result.error?.errors?.[0]?.message);
          return;
        }
      }

      // Обновляем блок с новыми данными
      const updated = { ...block, content: newData as object } as typeof block;
      onBlockChange(updated);
    } catch (error) {
      console.warn('Error updating block:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Editor
        data={data}
        onChange={handleDataChange}
      />
    </div>
  );
};

BlockContentEditor.displayName = 'BlockContentEditor';

export { BlockContentEditor };
export default BlockContentEditor;
