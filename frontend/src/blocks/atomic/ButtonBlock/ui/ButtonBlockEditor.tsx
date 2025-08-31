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

  const isEmpty = !buttonProps.text || buttonProps.text.trim().length === 0;

  // Формируем классы для контейнера
  const containerClassName = [
    className,
    'relative inline-block',
    editorMode && 'transition-all duration-200',
    editorMode && 'cursor-pointer group',
    isSelected && 'ring-2 ring-blue-500 ring-offset-2',
    editorMode && !isSelected && 'hover:ring-2 hover:ring-blue-300 hover:ring-opacity-50'
  ].filter(Boolean).join(' ');

  return (
    <div
      className={containerClassName}
      onClick={handleContainerClick}
    >
      <ButtonBlock
        {...buttonProps}
        text={buttonProps.text || (editorMode ? 'Новая кнопка' : 'Кнопка')}
        className={isEmpty && editorMode ? 'opacity-75 border-dashed' : undefined}
      />

      {/* Индикатор режима редактора */}
      {editorMode && isSelected && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg z-10">
          🔘 Кнопка
        </div>
      )}

      {/* Overlay для выделения в режиме редактора */}
      {editorMode && (
        <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded" />
      )}

      {/* Индикатор пустой кнопки */}
      {editorMode && isEmpty && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-gray-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Настройте текст в инспекторе →
        </div>
      )}
    </div>
  );
};

ButtonBlockEditor.displayName = 'ButtonBlockEditor';

export default ButtonBlockEditor;