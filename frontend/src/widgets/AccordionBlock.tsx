import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Typography } from 'shared/ui/atoms';
import BlockRenderer from 'widgets/BlockRenderer';
import type { Database } from '@my-forum/db-types';

type LayoutBlock = Database['public']['Tables']['layout_blocks']['Row'];

interface AccordionItem {
  id: string;
  title: string;
}

interface AccordionBlockData {
  sections: AccordionItem[];
  expandedSections?: string[];
}

interface AccordionBlockProps extends AccordionBlockData {
  // Новые props для работы с вложенными блоками
  editorMode?: boolean;
  blockId?: string;
  allBlocks?: LayoutBlock[];
  selectedBlockId?: string;
  onSelectBlock?: (id: string | null) => void;
  onUpdateBlock?: (updated: LayoutBlock) => void;
  onUpdateContent?: (next: AccordionBlockData) => void;
  // Metadata для стилизации
  metadata?: Record<string, unknown>;
}

const AccordionBlock: React.FC<AccordionBlockProps> = ({
  sections = [],
  expandedSections = [],
  editorMode = false,
  blockId,
  allBlocks = [],
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
  onUpdateContent,
  metadata = {}
}) => {
  const handleToggleSection = (sectionId: string) => {
    if (onUpdateContent) {
      const newExpanded = expandedSections.includes(sectionId)
        ? expandedSections.filter(id => id !== sectionId)
        : [...expandedSections, sectionId];
      onUpdateContent({ sections, expandedSections: newExpanded });
    }
  };

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
    <section className="space-y-2" style={containerStyles}>
      {sections.map((section) => (
        <div key={section.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
          {/* Заголовок секции */}
          <button
            onClick={() => handleToggleSection(section.id)}
            className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Typography as="h3" variant="h3" className="font-medium">
              {section.title}
            </Typography>
            <svg
              className={`w-5 h-5 transform transition-transform ${
                expandedSections.includes(section.id) ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Контент секции */}
          <div className={`overflow-hidden transition-all duration-200 ${
            expandedSections.includes(section.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              {editorMode && (
                <SlotDropZone
                  blockId={blockId}
                  slotName={section.id}
                  position={0}
                />
              )}

              <div className="min-h-[100px] rounded-lg border border-dashed border-gray-200 dark:border-gray-700 p-4">
                <BlockRenderer
                  blockTree={allBlocks || []}
                  editorMode={editorMode}
                  selectedBlockId={selectedBlockId}
                  onSelectBlock={onSelectBlock}
                  onUpdateBlock={onUpdateBlock}
                  parentBlockId={blockId || null}
                  slot={section.id}
                />
              </div>

              {editorMode && (
                <SlotDropZone
                  blockId={blockId}
                  slotName={section.id}
                  position={-1}
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default AccordionBlock;

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
      aria-label={`Дроп-зона для секции ${slotName}`}
    />
  );
};
