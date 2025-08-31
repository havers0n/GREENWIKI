import React, { useMemo, useCallback } from 'react';
import type {
  BlockNode,
  HeadingContent,
  ParagraphContent,
  ImageContent,
  ButtonContent,
  SpacerContent,
  SectionContent,
  IconContent,
  ColumnsContent,
  ContainerContent,
  TabsContent,
  AccordionContent,
  CardContent
} from '../../../types/api';
import { BlockType } from '../../../shared/consts/blockTypes';
import BlockWrapper from './BlockWrapper';
import DropZone from './DropZone';
import { BlockErrorBoundary, BlockErrorFallback } from './BlockErrorBoundary';
import BlockRenderer from './BlockRenderer';
import { useAppSelector } from '../../../store/hooks';
import { selectBlockWithEffectiveContent } from '../../../store/selectors/blockSelectors';
import { useDraggable } from '@dnd-kit/core';

// Компоненты рендереров для всех типов блоков
import ContainerSection from '../../../widgets/ContainerSection';
import ColumnsBlock from '../../../blocks/layout/ColumnsBlock/ui/ColumnsBlock';
import TabsBlock from '../../../widgets/TabsBlock';
import AccordionBlock from '../../../widgets/AccordionBlock';
import CardSection from '../../../widgets/CardSection';
import LazyHeadingBlock from '../../../widgets/AtomicBlocks/HeadingBlock';
import LazyParagraphBlock from '../../../widgets/AtomicBlocks/ParagraphBlock';
import LazyImageBlock from '../../../widgets/AtomicBlocks/ImageBlock';
import LazyButtonBlock from '../../../widgets/AtomicBlocks/ButtonBlock';
import LazySpacerBlock from '../../../widgets/AtomicBlocks/SpacerBlock';
import LazySectionBlock from '../../../widgets/AtomicBlocks/SectionBlock';
import LazyIconBlock from '../../../widgets/AtomicBlocks/IconBlock';



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

  // Drag & Drop configuration
  const draggableId = `canvas-block:${block.id}`;
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: draggableId,
    data: {
      type: 'block',
      blockId: block.id,
      blockType: block.block_type,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  // Функция рендеринга блока с строгой типизацией
  const renderBlockContent = useCallback(() => {
    switch (block.block_type) {
      case 'heading': {
        const content = effectiveContent as HeadingContent;
        return (
          <LazyHeadingBlock
            text={content.text}
            level={content.level}
            align={content.align}
            metadata={block.metadata as Record<string, unknown> || undefined}
            editorMode={editorMode}
          />
        );
      }

      case 'text': {
        const content = effectiveContent as ParagraphContent;
        return (
          <LazyParagraphBlock
            text={content.text}
            metadata={block.metadata as Record<string, unknown> || undefined}
            editorMode={editorMode}
          />
        );
      }

      case 'image': {
        const content = effectiveContent as ImageContent;
        return (
          <LazyImageBlock
            imageUrl={content.imageUrl}
            altText={content.altText}
            metadata={block.metadata as Record<string, unknown> || undefined}
            editorMode={editorMode}
          />
        );
      }

      case 'single_button': {
        const content = effectiveContent as ButtonContent;
        return (
          <LazyButtonBlock
            text={content.text}
            link={content.link}
            variant={content.variant}
            size={content.size}
            metadata={block.metadata as Record<string, unknown> || undefined}
            onClick={(event: React.MouseEvent) => {
              if (content.link && !content.link.startsWith('http')) {
                event.preventDefault();
                window.location.href = content.link;
              }
            }}
            blockId={block.id}
          />
        );
      }

      case 'spacer': {
        const content = effectiveContent as SpacerContent;
        return (
          <LazySpacerBlock
            height={content.height}
            customHeight={content.customHeight}
          />
        );
      }

      case 'section': {
        const content = effectiveContent as SectionContent;
        return (
          <LazySectionBlock
            backgroundColor={content.backgroundColor}
            padding={content.padding}
            maxWidth={content.maxWidth}
            metadata={block.metadata as Record<string, unknown> || undefined}
          />
        );
      }

      case 'icon': {
        const content = effectiveContent as IconContent;
        return (
          <LazyIconBlock
            icon={content.icon}
            size={content.size}
            color={content.color}
            metadata={block.metadata as Record<string, unknown> || undefined}
          />
        );
      }

      case 'columns': {
        const content = effectiveContent as ColumnsContent;
        return (
          <ColumnsBlock
            layout={content.layout}
            editorMode={editorMode}
            blockId={block.id}
            selectedBlockId={selectedBlockId}
            onSelectBlock={onSelectBlock}
            onUpdateBlock={onUpdateBlock}
            blockTree={block.children}
          />
        );
      }

      case 'container': {
        const content = effectiveContent as ContainerContent;
        return (
          <ContainerSection
            title={content.title}
            editorMode={editorMode}
            blockId={block.id}
            selectedBlockId={selectedBlockId}
            onSelectBlock={onSelectBlock}
            onUpdateBlock={onUpdateBlock}
            blockTree={block.children}
          />
        );
      }

      case 'tabs': {
        const content = effectiveContent as TabsContent;
        return (
          <TabsBlock
            tabs={content.tabs}
            activeTab={content.activeTab}
            metadata={block.metadata as Record<string, unknown> || undefined}
            editorMode={editorMode}
            blockId={block.id}
            selectedBlockId={selectedBlockId}
            onSelectBlock={onSelectBlock}
            onUpdateBlock={onUpdateBlock}
            blockTree={block.children}
          />
        );
      }

      case 'accordion': {
        const content = effectiveContent as AccordionContent;
        return (
          <AccordionBlock
            sections={content.sections}
            expandedSections={content.expandedSections}
            metadata={block.metadata as Record<string, unknown> || undefined}
            editorMode={editorMode}
            blockId={block.id}
            selectedBlockId={selectedBlockId}
            onSelectBlock={onSelectBlock}
            onUpdateBlock={onUpdateBlock}
            blockTree={block.children}
          />
        );
      }

      case 'card': {
        const content = effectiveContent as CardContent;
        return (
          <CardSection
            title={content.title}
            description={content.description}
            variant={content.variant}
            size={content.size}
            showHeader={content.showHeader}
            showFooter={content.showFooter}
            editorMode={editorMode}
            selectedBlockId={selectedBlockId}
            onSelectBlock={onSelectBlock}
            onUpdateBlock={onUpdateBlock}
            blockTree={block.children}
          />
        );
      }

      default:
        return (
          <div className="rounded-md border border-red-300 bg-red-50 text-red-700 p-3">
            Неизвестный тип блока: {block.block_type}
          </div>
        );
    }
  }, [block.block_type, effectiveContent, block.metadata, editorMode, block.id, onSelectBlock, onUpdateBlock, selectedBlockId, block.children]);

  // Мемоизация состояния выбора
  const isSelected = useMemo(() => selectedBlockId === block.id, [selectedBlockId, block.id]);

  // Мемоизация CSS классов
  const wrapperClassName = useMemo(() => {
    if (!editorMode) return undefined;
    return `relative rounded-md block-hover ${
      isSelected
        ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50 dark:bg-blue-900/20 transform scale-105 pulse-blue'
        : 'ring-1 ring-transparent hover:ring-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
    } cursor-move focus-ring`;
  }, [editorMode, isSelected]);

  // Мемоизация обработчика клика
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!editorMode || !onSelectBlock) return;
    e.stopPropagation();
    console.log('🎯 BLOCK: Clicked on block:', block.block_type);
    onSelectBlock(block.id);
  }, [editorMode, onSelectBlock, block.id, block.block_type]);

  return (
    <React.Fragment key={block.id}>
      <BlockWrapper
        depth={depth}
        blockType={block.block_type}
        dragRef={setDraggableRef}
        dragListeners={listeners}
        dragAttributes={attributes}
        dragStyle={style}
        isDragging={isDragging}
      >
        <div
          className={wrapperClassName}
          onClick={handleClick}
          data-block-id={block.id}
        >
          <BlockErrorBoundary
            blockId={block.id}
            blockType={block.block_type}
            fallback={
              <BlockErrorFallback
                blockId={block.id}
                blockType={block.block_type}
                onRetry={() => {
                  // При повторной попытке можно сбросить состояние или перезагрузить данные
                  console.log('Retrying block render:', block.id);
                }}
              />
            }
          >
            <React.Suspense fallback={<div className="flex justify-center items-center h-24">Загрузка...</div>}>
              {renderBlockContent()}
            </React.Suspense>
          </BlockErrorBoundary>
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
          <BlockRenderer
            blockTree={block.children}
            editorMode={editorMode}
            selectedBlockId={selectedBlockId}
            onSelectBlock={onSelectBlock}
            onUpdateBlock={onUpdateBlock}
          />
        </div>
      ) : (
        // Пустой контейнер - показываем DropZone (только для старых контейнеров)
        editorMode && block.block_type === BlockType.CONTAINER && (
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
