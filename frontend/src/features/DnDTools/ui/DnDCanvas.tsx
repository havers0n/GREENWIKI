import React from 'react';
import { VirtualizedCanvas } from '../../../widgets/VirtualizedCanvas';
import type { BlockNode } from '../../../types/api';

/**
 * DnDCanvas - абстракция для VirtualizedCanvas в инструментах D&D тестирования
 * Инкапсулирует использование VirtualizedCanvas для тестирования функциональности D&D
 */
interface DnDCanvasProps {
  blockTree: BlockNode[];
  editorMode?: boolean;
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string | null) => void;
  onUpdateBlock?: (block: BlockNode) => void;
}

const DnDCanvas: React.FC<DnDCanvasProps> = ({
  blockTree,
  editorMode = true,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock = () => {}
}) => {
  return (
    <VirtualizedCanvas
      blockTree={blockTree}
      editorMode={editorMode}
      selectedBlockId={selectedBlockId}
      onSelectBlock={onSelectBlock}
      onUpdateBlock={onUpdateBlock}
    />
  );
};

export default DnDCanvas;
