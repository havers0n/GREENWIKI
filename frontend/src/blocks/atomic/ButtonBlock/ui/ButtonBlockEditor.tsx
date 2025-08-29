import React from 'react';
import { ButtonBlock } from './ButtonBlock';
import type { ButtonBlockEditorProps } from '../types';

/**
 * ButtonBlockEditor - компонент для редактирования кнопки в CMS
 * Добавляет визуальные индикаторы режима редактора
 */
const ButtonBlockEditor: React.FC<ButtonBlockEditorProps> = ({
  editorMode = false,
  isSelected = false,
  onSelect,
  onUpdate,
  className,
  ...buttonProps
}) => {
  // Обработчик клика для выбора блока в режиме редактора
  const handleContainerClick = (event: React.MouseEvent) => {
    if (editorMode && onSelect) {
      event.stopPropagation();
      onSelect();
    }
  };

  // Формируем классы для контейнера
  const containerClassName = [
    className,
    'relative',
    editorMode && 'cursor-pointer transition-all duration-200',
    isSelected && 'ring-2 ring-blue-500 ring-offset-2'
  ].filter(Boolean).join(' ');

  return (
    <div
      className={containerClassName}
      onClick={handleContainerClick}
    >
      <ButtonBlock
        {...buttonProps}
        className={undefined} // Убираем className, так как он уже применен к контейнеру
      />

      {/* Индикатор режима редактора */}
      {editorMode && isSelected && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg">
          Кнопка
        </div>
      )}

      {/* Overlay для выделения в режиме редактора */}
      {editorMode && (
        <div className="absolute inset-0 bg-blue-500/10 opacity-0 hover:opacity-100 transition-opacity pointer-events-none rounded" />
      )}
    </div>
  );
};

ButtonBlockEditor.displayName = 'ButtonBlockEditor';

export { ButtonBlockEditor };
export default ButtonBlockEditor;
