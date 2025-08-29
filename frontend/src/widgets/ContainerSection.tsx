import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Typography } from 'shared/ui/atoms';
import BlockRenderer from 'widgets/BlockRenderer';
import type { Database } from '@my-forum/db-types';

type LayoutBlock = Database['public']['Tables']['layout_blocks']['Row'];

interface ContainerSectionProps {
  title?: string;
  layout?: 'two' | 'three';
  // Новые props для работы с вложенными блоками
  editorMode?: boolean;
  blockId?: string;
  allBlocks?: LayoutBlock[];
  selectedBlockId?: string;
  onSelectBlock?: (id: string | null) => void;
  onUpdateBlock?: (updated: LayoutBlock) => void;
  onUpdateContent?: (next: ContainerSectionProps) => void;
  // Metadata для стилизации
  metadata?: Record<string, unknown>;
}

const ContainerSection: React.FC<ContainerSectionProps> = ({
  title,
  layout = 'two',
  editorMode = false,
  blockId,
  allBlocks = [],
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
  onUpdateContent,
  metadata = {}
}) => {
  const gridCols = layout === 'three' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2';
  const columnCount = layout === 'three' ? 3 : 2;
  const slots = ['column1', 'column2', 'column3'].slice(0, columnCount);

  // Генерация стилей из metadata
  const generateStyles = () => {
    const styles: React.CSSProperties = {};

    // Spacing
    const spacing = metadata.spacing as Record<string, string> | undefined;
    if (spacing) {
      if (spacing.paddingTop) styles.paddingTop = spacing.paddingTop;
      if (spacing.paddingRight) styles.paddingRight = spacing.paddingRight;
      if (spacing.paddingBottom) styles.paddingBottom = spacing.paddingBottom;
      if (spacing.paddingLeft) styles.paddingLeft = spacing.paddingLeft;
      if (spacing.marginTop) styles.marginTop = spacing.marginTop;
      if (spacing.marginRight) styles.marginRight = spacing.marginRight;
      if (spacing.marginBottom) styles.marginBottom = spacing.marginBottom;
      if (spacing.marginLeft) styles.marginLeft = spacing.marginLeft;
    }

    // Border
    const border = metadata.border as Record<string, string> | undefined;
    if (border) {
      if (border.width && border.style && border.style !== 'none') {
        styles.borderWidth = border.width;
        styles.borderStyle = border.style;
        if (border.color) styles.borderColor = border.color;
      }
      if (border.radius) styles.borderRadius = border.radius;
    }

    // Background
    const background = metadata.background as Record<string, unknown> | undefined;
    if (background) {
      const bgType = background.type as string;
      if (bgType === 'color' && background.color) {
        styles.backgroundColor = background.color as string;
      } else if (bgType === 'gradient' && background.gradientStart && background.gradientEnd) {
        styles.background = `linear-gradient(135deg, ${background.gradientStart}, ${background.gradientEnd})`;
      } else if (bgType === 'image' && background.imageUrl) {
        styles.backgroundImage = `url(${background.imageUrl})`;
        styles.backgroundSize = 'cover';
        styles.backgroundPosition = 'center';
      }
    }

    return styles;
  };

  const containerStyles = generateStyles();

  return (
    <section className="space-y-4">
      {title && (
        <Typography as="h2" variant="h2">{title}</Typography>
      )}
      <div
        className={`grid ${gridCols} gap-4`}
        style={containerStyles}
      >
        {slots.map((slotName, colIdx) => (
          <div key={slotName} className="space-y-2">
            {editorMode && (
              <SlotDropZone 
                blockId={blockId} 
                slotName={slotName} 
                position={0}
              />
            )}
            
            <div className="min-h-[100px] rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-2">
              <BlockRenderer
                pageIdentifier="" // Не используется для вложенных блоков
                blocks={allBlocks}
                editorMode={editorMode}
                selectedBlockId={selectedBlockId}
                onSelectBlock={onSelectBlock}
                onUpdateBlock={onUpdateBlock}
                parentBlockId={blockId || null}
                slot={slotName}
              />
            </div>
            
            {editorMode && (
              <SlotDropZone 
                blockId={blockId} 
                slotName={slotName} 
                position={-1} // Конец слота
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContainerSection;

const SlotDropZone: React.FC<{ 
  blockId?: string; 
  slotName: string; 
  position: number;
}> = ({ blockId, slotName, position }) => {
  const slotId = `slot:${blockId}:${slotName}:${position}`;
  const { setNodeRef, isOver } = useDroppable({ id: slotId });
  
  const cls = isOver 
    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
    : 'border-gray-300 dark:border-gray-600';
  
  return (
    <div 
      ref={setNodeRef} 
      className={`h-2 border border-dashed rounded ${cls} transition-colors`}
      aria-label={`Дроп-зона для слота ${slotName}`}
    />
  );
};