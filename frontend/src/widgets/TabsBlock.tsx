import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import BlockRenderer from 'widgets/BlockRenderer';
import type { Database } from '@my-forum/db-types';

type LayoutBlock = Database['public']['Tables']['layout_blocks']['Row'];

interface TabItem {
  id: string;
  title: string;
}

interface TabsBlockData {
  tabs: TabItem[];
  activeTab?: string;
}

interface TabsBlockProps extends TabsBlockData {
  // Новые props для работы с вложенными блоками
  editorMode?: boolean;
  blockId?: string;
  allBlocks?: LayoutBlock[];
  selectedBlockId?: string;
  onSelectBlock?: (id: string | null) => void;
  onUpdateBlock?: (updated: LayoutBlock) => void;
  onUpdateContent?: (next: TabsBlockData) => void;
  // Metadata для стилизации
  metadata?: Record<string, unknown>;
}

const TabsBlock: React.FC<TabsBlockProps> = ({
  tabs = [],
  activeTab,
  editorMode = false,
  blockId,
  allBlocks = [],
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
  onUpdateContent,
  metadata = {}
}) => {
  // Если нет активной вкладки, выбираем первую
  const currentActiveTab = activeTab || (tabs.length > 0 ? tabs[0].id : '');

  const handleTabChange = (tabId: string) => {
    if (onUpdateContent) {
      onUpdateContent({ tabs, activeTab: tabId });
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
    <section className="space-y-4" style={containerStyles}>
      {/* Вкладки */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-1" aria-label="Вкладки">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                currentActiveTab === tab.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.title}
            </button>
          ))}
        </nav>
      </div>

      {/* Контент активной вкладки */}
      <div className="min-h-[200px]">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={currentActiveTab === tab.id ? 'block' : 'hidden'}
          >
            {editorMode && (
              <SlotDropZone
                blockId={blockId}
                slotName={tab.id}
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
                slot={tab.id}
              />
            </div>

            {editorMode && (
              <SlotDropZone
                blockId={blockId}
                slotName={tab.id}
                position={-1}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default TabsBlock;

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
      aria-label={`Дроп-зона для вкладки ${slotName}`}
    />
  );
};
