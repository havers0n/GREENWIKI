import * as React from 'react';
import { useMemo, useCallback, Suspense, lazy } from 'react';
import type { BlockNode } from '../../../types/api';

// Ленивая загрузка тяжелых компонентов
const RenderBlockNode = lazy(() => import('./RenderBlockNode'));
const DropZone = lazy(() => import('./DropZone'));
const VirtualizedCanvas = lazy(() => import('../../VirtualizedCanvas').then(module => ({ default: module.VirtualizedCanvas })));
import { blockRegistry } from '../../../shared/config/blockRegistry';

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




  // Поиск пути к выбранному блоку для хлебных крошек и отображения глубины
  const findPath = useCallback((nodes: BlockNode[], targetId: string): BlockNode[] | null => {
    for (const node of nodes) {
      if (node.id === targetId) return [node];
      if (node.children && node.children.length > 0) {
        const childPath = findPath(node.children, targetId);
        if (childPath) return [node, ...childPath];
      }
    }
    return null;
  }, []);

  const selectedPath = useMemo(() => {
    if (!selectedBlockId) return null;
    return findPath(blockTree, selectedBlockId) || null;
  }, [blockTree, selectedBlockId]);

  // Определяем, использовать ли виртуализацию (для списков > 20 блоков)
  const useVirtualization = useMemo(() => {
    const totalBlocks = blockTree.reduce((count, block) => {
      const countChildren = (b: BlockNode): number =>
        1 + (b.children ? b.children.reduce((sum, child) => sum + countChildren(child), 0) : 0);
      return count + countChildren(block);
    }, 0);
    return totalBlocks > 20;
  }, [blockTree]);

  const renderBreadcrumbs = () => {
    if (!editorMode || !selectedPath || selectedPath.length === 0) return null;
    return (
      <div className="sticky top-0 z-10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 -mx-2 px-2 py-2 mb-2 rounded">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
          {selectedPath.map((node, index) => {
            const isLast = index === selectedPath.length - 1;
            const name = blockRegistry[node.block_type]?.name || node.block_type;
            return (
              <React.Fragment key={node.id}>
                <button
                  type="button"
                  className={`hover:underline ${isLast ? 'font-semibold text-gray-900 dark:text-white' : ''}`}
                  onClick={() => onSelectBlock?.(node.id)}
                  disabled={isLast}
                  title={name}
                >
                  {name}
                </button>
                {!isLast && <span className="text-gray-400">/</span>}
              </React.Fragment>
            );
          })}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-gray-400">Глубина:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
              {Math.max(0, (selectedPath?.length || 1) - 1)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Рендерим breadcrumbs вне Suspense для лучшей производительности
  const breadcrumbsElement = renderBreadcrumbs();

  return (
    <div className="space-y-4">
      {breadcrumbsElement}
      <Suspense fallback={<div className="flex items-center justify-center p-8">Загрузка редактора...</div>}>
        {useVirtualization ? (
          // Используем виртуализацию для больших списков
          <VirtualizedCanvas
            blockTree={blockTree}
            editorMode={editorMode}
            selectedBlockId={selectedBlockId}
            onSelectBlock={onSelectBlock}
            onUpdateBlock={onUpdateBlock}
          />
        ) : (
          // Обычный рендер для небольших списков
          <>
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
                  selectedBlockId={selectedBlockId || undefined}
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
          </>
        )}
      </Suspense>
    </div>
  );
});

BlockRenderer.displayName = 'BlockRenderer';

export default BlockRenderer;