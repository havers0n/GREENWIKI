import React, { useState } from 'react';
import { ButtonBlock, ButtonBlockEditor } from './index';
import type { ButtonBlockMetadata } from './types';

/**
 * Примеры использования нового ButtonBlock
 */

// Пример с различными вариантами кнопок
export const ButtonVariantsExample: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Варианты кнопок</h2>

      <div className="space-y-2">
        <ButtonBlock
          text="Primary Button"
          variant="primary"
          size="md"
        />

        <ButtonBlock
          text="Secondary Button"
          variant="secondary"
          size="md"
        />

        <ButtonBlock
          text="Danger Button"
          variant="danger"
          size="md"
        />

        <ButtonBlock
          text="Ghost Button"
          variant="ghost"
          size="md"
        />
      </div>
    </div>
  );
};

// Пример с различными размерами
export const ButtonSizesExample: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Размеры кнопок</h2>

      <div className="space-y-2">
        <ButtonBlock
          text="Small Button"
          variant="primary"
          size="sm"
        />

        <ButtonBlock
          text="Medium Button"
          variant="primary"
          size="md"
        />

        <ButtonBlock
          text="Large Button"
          variant="primary"
          size="lg"
        />
      </div>
    </div>
  );
};

// Пример с ссылками
export const ButtonLinksExample: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Кнопки со ссылками</h2>

      <div className="space-y-2">
        <ButtonBlock
          text="Внутренняя ссылка"
          link="/dashboard"
          variant="primary"
        />

        <ButtonBlock
          text="Внешняя ссылка"
          link="https://example.com"
          variant="secondary"
        />

        <ButtonBlock
          text="Ссылка без действия"
          link="#"
          variant="ghost"
        />
      </div>
    </div>
  );
};

// Пример с metadata для стилизации
export const ButtonMetadataExample: React.FC = () => {
  const metadataWithStyles: ButtonBlockMetadata = {
    spacing: {
      marginTop: '10px',
      marginBottom: '10px',
      marginLeft: '20px'
    },
    border: {
      width: '2px',
      style: 'solid',
      color: '#e5e7eb',
      radius: '8px'
    },
    textColor: '#1f2937',
    backgroundColor: '#f9fafb'
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Кнопка с кастомными стилями</h2>

      <ButtonBlock
        text="Стилизованная кнопка"
        variant="secondary"
        metadata={metadataWithStyles}
      />
    </div>
  );
};

// Пример использования в CMS редакторе
export const ButtonEditorExample: React.FC = () => {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Редактор кнопок (CMS режим)</h2>

      <div className="space-y-2">
        <ButtonBlockEditor
          text="Редактируемая кнопка 1"
          variant="primary"
          editorMode={true}
          isSelected={selectedBlockId === 'button-1'}
          onSelect={() => setSelectedBlockId('button-1')}
          blockId="button-1"
        />

        <ButtonBlockEditor
          text="Редактируемая кнопка 2"
          variant="secondary"
          editorMode={true}
          isSelected={selectedBlockId === 'button-2'}
          onSelect={() => setSelectedBlockId('button-2')}
          blockId="button-2"
        />
      </div>

      <p className="text-sm text-gray-600">
        Выбранная кнопка: {selectedBlockId || 'ни одна'}
      </p>
    </div>
  );
};

// Пример с обработчиком клика
export const ButtonWithClickHandlerExample: React.FC = () => {
  const handleClick = (event: React.MouseEvent) => {
    console.log('Button clicked!', event);
    alert('Кнопка нажата!');
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Кнопка с обработчиком клика</h2>

      <ButtonBlock
        text="Нажми меня"
        variant="primary"
        onClick={handleClick}
      />
    </div>
  );
};

export const ButtonBlockExamples = {
  ButtonVariantsExample,
  ButtonSizesExample,
  ButtonLinksExample,
  ButtonMetadataExample,
  ButtonEditorExample,
  ButtonWithClickHandlerExample
};
