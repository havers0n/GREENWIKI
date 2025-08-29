import React, { useState, useEffect } from 'react';
import { fetchLayoutByPage } from 'shared/api/layout';
import type { Database } from '@my-forum/db-types';
import { blockRegistry } from 'shared/config/blockRegistry';
import { Spinner } from 'shared/ui/atoms';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { BlockWrapper } from './BlockWrapper';

type LayoutBlock = Database['public']['Tables']['layout_blocks']['Row'];

interface BlockRendererProps {
  pageIdentifier: string;
  blocks?: LayoutBlock[];
  /** Включает режим редактора: клики по блокам выбирают их, выбранный подсвечивается */
  editorMode?: boolean;
  /** ID выбранного блока для подсветки */
  selectedBlockId?: string | null;
  /** Колбэк выбора блока по клику в превью (null — снять выделение) */
  onSelectBlock?: (id: string | null) => void;
  /** Колбэк обновления контента блока (используется контейнерами) */
  onUpdateBlock?: (updated: LayoutBlock) => void;
  /** ID родительского блока для фильтрации дочерних элементов */
  parentBlockId?: string | null;
  /** Слот для фильтрации дочерних элементов */
  slot?: string | null;
}

// Use a permissive props type to allow different sections to define their own props contracts
// while keeping mapping strongly keyed by string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = React.ComponentType<any>;

const LoadingState = {
  Loading: 'loading',
  Loaded: 'loaded',
  Error: 'error',
  Empty: 'empty',
} as const;

type LoadingState = typeof LoadingState[keyof typeof LoadingState];

const BlockRenderer: React.FC<BlockRendererProps> = ({ 
  pageIdentifier, 
  blocks: externalBlocks, 
  editorMode = false, 
  selectedBlockId, 
  onSelectBlock, 
  onUpdateBlock,
  parentBlockId = null,
  slot = null
}) => {
  const [allBlocks, setAllBlocks] = useState<LayoutBlock[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.Loading);
  const [error, setError] = useState<string | null>(null);

  // If blocks are provided from outside (e.g., EditorManager), use them and skip fetching
  useEffect(() => {
    if (typeof externalBlocks !== 'undefined') {
      setAllBlocks(externalBlocks);
      setLoadingState(externalBlocks.length > 0 ? LoadingState.Loaded : LoadingState.Empty);
    }
  }, [externalBlocks]);

  // Fallback: fetch blocks only when no external blocks are provided
  useEffect(() => {
    if (typeof externalBlocks !== 'undefined') return;
    const loadLayout = async () => {
      try {
        setLoadingState(LoadingState.Loading);
        const layoutBlocks = await fetchLayoutByPage(pageIdentifier);

        if (layoutBlocks.length === 0) {
          setLoadingState(LoadingState.Empty);
        } else {
          setAllBlocks(layoutBlocks);
          setLoadingState(LoadingState.Loaded);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoadingState(LoadingState.Error);
      }
    };

    void loadLayout();
  }, [pageIdentifier, externalBlocks]);

  if (loadingState === LoadingState.Loading) {
    return <div>Loading...</div>;
  }

  if (loadingState === LoadingState.Error) {
    return <div>Error fetching data: {error}</div>;
  }

  if (loadingState === LoadingState.Empty) {
    return null;
  }

  // Рекурсивная функция рендеринга дерева блоков
  const renderBlockTree = (parentId: string | null, depth: number, currentSlot?: string | null): React.ReactNode => {
    // Фильтруем блоки по родительскому блоку и слоту
    const childBlocks = allBlocks.filter(block => {
      const matchesParent = block.parent_block_id === parentId ||
                           (parentId === null && (block.parent_block_id === null || block.parent_block_id === ''));
      const matchesSlot = currentSlot === null || block.slot === currentSlot;
      return matchesParent && matchesSlot;
    });

    // Сортируем по позиции
    const sortedBlocks = childBlocks
      .slice()
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    return sortedBlocks.map((block, idx) => {
      const spec = blockRegistry[block.block_type];
      const Component = (spec?.Renderer as AnyComponent | undefined);

      if (!Component) {
        return (
          <BlockWrapper key={block.id} depth={depth} showDragHandle={editorMode}>
            <div className="rounded-md border border-red-300 bg-red-50 text-red-700 p-3">
              Неизвестный тип блока: {block.block_type}
            </div>
          </BlockWrapper>
        );
      }

      const isSelected = selectedBlockId === block.id;
      const wrapperClassName = editorMode
        ? `relative rounded-md transition-all duration-200 ${
            isSelected
              ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50 dark:bg-blue-900/20 transform scale-105'
              : 'ring-1 ring-transparent hover:ring-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
          } cursor-move`
        : undefined;

      // console.log('BlockRenderer: Rendering block', block.id, 'selected:', isSelected);

      const handleClick = editorMode && onSelectBlock
        ? (e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            console.log('🎯 BLOCK: Clicked on block:', block.block_type);
            onSelectBlock(block.id);
          }
        : undefined;

      const handleDoubleClick = editorMode && onSelectBlock
        ? (e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            console.log('🎯 BLOCK: Double-clicked on block:', block.block_type);
            onSelectBlock(block.id);
          }
        : undefined;

      return (
        <React.Fragment key={block.id}>
          {/* Slot перед блоком */}
          {editorMode && <Slot index={idx} slotName={currentSlot || undefined} parentId={parentId} />}

          <BlockWrapper
            depth={depth}
            showDragHandle={editorMode}
            blockId={selectedBlockId === block.id ? block.id : undefined}
          >
            <DraggableWrapper id={block.id} className={wrapperClassName} enabled={editorMode} onClick={handleClick} onDoubleClick={handleDoubleClick}>
              <React.Suspense fallback={<div className="flex justify-center items-center h-24"><Spinner /></div>}>
                <Component
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  {...(block.content as Record<string, unknown>)}
                  // Metadata для стилизации
                  metadata={block.metadata as Record<string, unknown>}
                  // Режим редактора и API для контейнеров
                  editorMode={editorMode}
                  blockId={block.id}
                  allBlocks={allBlocks}
                  selectedBlockId={selectedBlockId}
                  onSelectBlock={onSelectBlock}
                  onUpdateBlock={onUpdateBlock}
                  onUpdateContent={(nextContent: unknown) => {
                    if (!onUpdateBlock) return;
                    const updated = { ...block, content: nextContent as object } as LayoutBlock;
                    onUpdateBlock(updated);
                  }}
                />
              </React.Suspense>
            </DraggableWrapper>
          </BlockWrapper>

          {/* Рекурсивно рендерим дочерние блоки */}
          {renderBlockTree(block.id, depth + 1)}

          {/* Slot после блока */}
          {editorMode && <Slot index={idx + 1} slotName={currentSlot || undefined} parentId={parentId} />}
        </React.Fragment>
      );
    });
  };

  const Slot: React.FC<{ index: number; slotName?: string; parentId?: string | null }> = ({ index, slotName, parentId }) => {
    if (!editorMode) return null;
    const slotId = slotName
      ? `slot:${parentId || 'root'}:${slotName}:${index}`
      : `canvas-slot:${parentId || 'root'}:${index}`;

    const { setNodeRef, isOver } = useDroppable({ id: slotId });
    const ring = isOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-300 dark:border-gray-700';
    const isCanvasSlot = !slotName;

    return (
      <BlockWrapper depth={parentId ? 1 : 0} showDragHandle={false}>
        <div
          ref={setNodeRef}
          className={`my-2 rounded-md border border-dashed ${ring} flex items-center justify-center transition-all duration-200 ${
            isCanvasSlot ? 'h-8' : 'h-4'
          }`}
          aria-label={slotName ? `Вставить в ${slotName} на позицию ${index + 1}` : `Вставить на позицию ${index + 1}`}
        >
          {isOver && (
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              {slotName ? `➤ Вставить в ${slotName}` : '➤ Перетащите сюда'}
            </span>
          )}
          {!isOver && isCanvasSlot && (
            <span className="text-xs text-gray-400 dark:text-gray-600">
              Позиция {index + 1}
            </span>
          )}
        </div>
      </BlockWrapper>
    );
  };

  return (
    <div className="space-y-4">
      {/* Начинаем рендеринг с корневого уровня */}
      {renderBlockTree(parentBlockId, 0, slot)}
    </div>
  );
};

export default BlockRenderer;

const DraggableWrapper: React.FC<{
  id: string;
  className?: string;
  enabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDoubleClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  children: React.ReactNode;
}> = ({ id, className, enabled = false, onClick, onDoubleClick, children }) => {
  if (!enabled) {
    return (
      <div className={className} onClick={onClick} onDoubleClick={onDoubleClick} data-block-id={id}>
        {children}
      </div>
    );
  }

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `canvas-block:${id}` });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.9 : 1,
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={className}
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
      style={style}
      data-block-id={id}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
};