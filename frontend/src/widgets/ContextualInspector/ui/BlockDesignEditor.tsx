import React from 'react';
import { SpacingControl, ColorPicker, BorderControl, BackgroundControl } from '../controls';
import type { BlockDesignEditorProps } from '../types';

/**
 * Компонент для редактирования дизайна блока
 * Содержит различные контролы в зависимости от типа блока
 */
const BlockDesignEditor: React.FC<BlockDesignEditorProps> = ({
  block,
  metadata,
  onMetadataChange
}) => {
  const blockType = block.block_type;

  // Проверяем, поддерживает ли блок дизайн настройки
  const supportsDesign = [
    'container_section',
    'single_button',
    'heading',
    'tabs',
    'accordion'
  ].includes(blockType);

  if (!supportsDesign) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <div className="text-2xl mb-2">🎨</div>
        <p className="text-sm">Дизайн настройки недоступны для этого типа блока</p>
      </div>
    );
  }

  const handleSpacingChange = (spacing: unknown) => {
    onMetadataChange({ ...metadata, spacing });
  };

  const handleBorderChange = (border: unknown) => {
    onMetadataChange({ ...metadata, border });
  };

  const handleBackgroundChange = (background: unknown) => {
    onMetadataChange({ ...metadata, background });
  };

  const handleTextColorChange = (textColor: string) => {
    onMetadataChange({ ...metadata, textColor });
  };

  return (
    <div className="space-y-4">
      {/* Spacing Control - для всех поддерживаемых блоков */}
      <SpacingControl
        value={metadata.spacing as any}
        onChange={handleSpacingChange}
      />

      {/* Border Control - для контейнера и кнопки */}
      {(blockType === 'container_section' || blockType === 'single_button') && (
        <BorderControl
          value={metadata.border as any}
          onChange={handleBorderChange}
        />
      )}

      {/* Background Control - только для контейнера */}
      {blockType === 'container_section' && (
        <BackgroundControl
          value={metadata.background as any}
          onChange={handleBackgroundChange}
        />
      )}

      {/* Color Picker для текста - для кнопки и заголовка */}
      {(blockType === 'single_button' || blockType === 'heading') && (
        <ColorPicker
          label="Цвет текста"
          value={metadata.textColor as string}
          onChange={handleTextColorChange}
        />
      )}
    </div>
  );
};

BlockDesignEditor.displayName = 'BlockDesignEditor';

export { BlockDesignEditor };
export default BlockDesignEditor;
