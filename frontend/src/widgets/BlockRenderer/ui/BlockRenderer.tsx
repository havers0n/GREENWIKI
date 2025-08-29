import * as React from 'react';
import { useMemo } from 'react';
import type { BlockNode } from '../../../types/api';
import { useDroppable } from '@dnd-kit/core';
import RenderBlockNode from './RenderBlockNode';
import DropZone from './DropZone';

interface BlockRendererProps {
  blockTree: BlockNode[];
  /** Включает режим редактора: клики по блокам выбирают их, выбранный подсвечивается */
  editorMode?: boolean;
  /** ID выбранного блока для подсветки */
  selectedBlockId?: string | null;
  /** Колбэк выбора блока по клику в превью (null — снять выделение) */
  onSelectBlock?: (id: string | null) => void;
  /** Колбэк обновления контента блока */
  onUpdateBlock?: (updated: BlockNode) => void;
}

const BlockRenderer = React.memo<BlockRendererProps>(({
  blockTree,
  editorMode = false,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock
}) => {
  // Мемоизация droppable конфигурации
  const droppableConfig = useMemo(() => ({
    id: 'canvas-dropzone',
  }), []);

  const { isOver: isCanvasOver } = useDroppable(droppableConfig);
  return (
    <div className="space-y-4">
      {blockTree.map((block, index) => (
        <React.Fragment key={block.id}>
          {editorMode && index === 0 && (
            <DropZone
              parentId={null}
              position={0}
              className="mb-4"
            />
          )}
          <RenderBlockNode
            block={block}
            depth={0}
            editorMode={editorMode}
            selectedBlockId={selectedBlockId}
            onSelectBlock={onSelectBlock}
            onUpdateBlock={onUpdateBlock}
          />
          {editorMode && index < blockTree.length - 1 && (
            <DropZone
              parentId={null}
              position={index + 1}
              className="my-4"
            />
          )}
        </React.Fragment>
      ))}
      {editorMode && blockTree.length === 0 && (
        <DropZone
          parentId={null}
          position={0}
          isEmpty={true}
          className="min-h-[200px]"
        />
      )}
    </div>
  );
});

export default BlockRenderer;