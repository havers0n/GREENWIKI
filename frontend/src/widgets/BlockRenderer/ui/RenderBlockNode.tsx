import React, { useMemo, useCallback } from 'react';
import type { BlockNode } from '../../../types/api';
import { blockRegistry } from '../../../shared/config/blockRegistry';
import { BlockWrapper } from './BlockWrapper';
import DropZone from './DropZone';
import { useAppSelector } from '../../../store/hooks';
import { selectBlockWithEffectiveContent } from '../../../store/selectors/blockSelectors';

// Новые чистые блоки
import { ContainerBlockEditor } from '../../../blocks/layout/ContainerBlock';
import { ButtonBlockEditor } from '../../../blocks/atomic/ButtonBlock';

type AnyComponent = React.ComponentType<any>;

interface RenderBlockNodeProps {
  block: BlockNode;
  depth: number;
  editorMode?: boolean;
  selectedBlockId?: string;
  onSelectBlock?: (id: string | null) => void;
  onUpdateBlock?: (block: BlockNode) => void;
}

const RenderBlockNode = React.memo<RenderBlockNodeProps>(({
  block,
  depth,
  editorMode = false,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock
}) => {
  // Мемоизация селектора для предотвращения лишних перерисовок
  const blockWithEffectiveContent = useAppSelector(state =>
    selectBlockWithEffectiveContent(state, block.id)
  );

  // Мемоизация вычисляемых значений
  const effectiveBlock = useMemo(() => blockWithEffectiveContent || block, [blockWithEffectiveContent, block]);
  const effectiveContent = effectiveBlock.content;

  // Выбор компонента для рендеринга блока
  const Component = useMemo(() => {
    // Новые чистые блоки
    switch (block.block_type) {
      case 'container_section':
        return ContainerBlockEditor;
      case 'single_button':
        return ButtonBlockEditor;
      default:
        // Для остальных типов используем старый реестр
        const spec = blockRegistry[block.block_type];
        return spec?.Renderer as AnyComponent | undefined;
    }
  }, [block.block_type]);

  // Мемоизация состояния выбора
  const isSelected = useMemo(() => selectedBlockId === block.id, [selectedBlockId, block.id]);

  // Мемоизация CSS классов
  const wrapperClassName = useMemo(() => {
    if (!editorMode) return undefined;
    return `relative rounded-md transition-all duration-200 ${
      isSelected
        ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50 dark:bg-blue-900/20 transform scale-105'
        : 'ring-1 ring-transparent hover:ring-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
    } cursor-move`;
  }, [editorMode, isSelected]);

  // Мемоизация обработчика клика
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!editorMode || !onSelectBlock) return;
    e.stopPropagation();
    console.log('🎯 BLOCK: Clicked on block:', block.block_type);
    onSelectBlock(block.id);
  }, [editorMode, onSelectBlock, block.id, block.block_type]);

  if (!Component) {
    return (
      <BlockWrapper depth={depth} showDragHandle={editorMode}>
        <div className="rounded-md border border-red-300 bg-red-50 text-red-700 p-3">
          Неизвестный тип блока: {block.block_type}
        </div>
      </BlockWrapper>
    );
  }

  return (
    <React.Fragment key={block.id}>
      <BlockWrapper
        depth={depth}
        showDragHandle={editorMode}
        blockId={selectedBlockId === block.id ? block.id : undefined}
      >
        <div
          className={wrapperClassName}
          onClick={handleClick}
          data-block-id={block.id}
        >
          <React.Suspense fallback={<div className="flex justify-center items-center h-24">Загрузка...</div>}>
            {block.block_type === 'container_section' ? (
              // Новые контейнеры
              <ContainerBlockEditor
                layout={effectiveContent?.layout || 'vertical'}
                gap={effectiveContent?.gap || 'medium'}
                padding={effectiveContent?.padding || 'medium'}
                backgroundColor={effectiveContent?.backgroundColor}
                borderRadius={effectiveContent?.borderRadius}
                maxWidth={effectiveContent?.maxWidth}
                title={effectiveContent?.title}
                metadata={block.metadata}
                editorMode={editorMode}
                blockId={block.id}
                selectedBlockId={selectedBlockId}
                onSelectBlock={onSelectBlock}
                onUpdateBlock={onUpdateBlock}
                onUpdateContent={(nextContent: unknown) => {
                  if (!onUpdateBlock) return;
                  const updatedBlock = { ...block, content: nextContent as object } as BlockNode;
                  onUpdateBlock(updatedBlock);
                }}
              />
            ) : block.block_type === 'single_button' ? (
              // Новые кнопки
              <ButtonBlockEditor
                text={effectiveContent?.text || 'Кнопка'}
                link={effectiveContent?.link}
                linkTarget={effectiveContent?.linkTarget}
                variant={effectiveContent?.variant || 'primary'}
                size={effectiveContent?.size || 'md'}
                metadata={block.metadata}
                onClick={(event) => {
                  // Обработка клика по кнопке
                  if (effectiveContent?.link && !effectiveContent.link.startsWith('http')) {
                    event.preventDefault();
                    window.location.href = effectiveContent.link;
                  }
                }}
                editorMode={editorMode}
                blockId={block.id}
                isSelected={isSelected}
                onSelect={() => onSelectBlock?.(block.id)}
                onUpdate={(updates) => {
                  if (!onUpdateBlock) return;
                  const updatedBlock = { ...block, content: { ...effectiveContent, ...updates } } as BlockNode;
                  onUpdateBlock(updatedBlock);
                }}
              />
            ) : (
              // Старые компоненты через реестр
              <Component
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                {...(effectiveContent as Record<string, unknown>)}
                // Metadata для стилизации
                metadata={block.metadata as Record<string, unknown>}
                // Режим редактора и API для контейнеров
                editorMode={editorMode}
                blockId={block.id}
                selectedBlockId={selectedBlockId}
                onSelectBlock={onSelectBlock}
                onUpdateBlock={onUpdateBlock}
                onUpdateContent={(nextContent: unknown) => {
                  if (!onUpdateBlock) return;
                  const updatedBlock = { ...block, content: nextContent as object } as BlockNode;
                  onUpdateBlock(updatedBlock);
                }}
              />
            )}
          </React.Suspense>
        </div>
      </BlockWrapper>

      {/* Рекурсивно рендерим дочерние блоки */}
      {block.children && block.children.length > 0 && block.block_type !== 'container_section' ? (
        <div className="ml-4 border-l-2 border-gray-200 dark:border-gray-700">
          {editorMode && (
            <DropZone
              parentId={block.id}
              position={0}
              className="ml-4 mb-2"
            />
          )}
          {block.children.map((child, index) => (
            <React.Fragment key={child.id}>
              <RenderBlockNode
                block={child}
                depth={depth + 1}
                editorMode={editorMode}
                selectedBlockId={selectedBlockId}
                onSelectBlock={onSelectBlock}
                onUpdateBlock={onUpdateBlock}
              />
              {editorMode && index < block.children.length - 1 && (
                <DropZone
                  parentId={block.id}
                  position={index + 1}
                  className="ml-4 my-2"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      ) : (
        // Пустой контейнер - показываем DropZone (только для старых контейнеров)
        editorMode && block.block_type === 'container' && (
          <div className="ml-4 border-l-2 border-gray-200 dark:border-gray-700">
            <DropZone
              parentId={block.id}
              position={0}
              isEmpty={true}
              className="ml-4"
            />
          </div>
        )
      )}
    </React.Fragment>
  );
});

export default RenderBlockNode;
