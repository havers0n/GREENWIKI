import React from 'react';
import RenderBlockNode from 'widgets/BlockRenderer/ui/RenderBlockNode';
import type { BlockNode } from '../types/api';

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
  allBlocks?: BlockNode[];
  selectedBlockId?: string;
  onSelectBlock?: (id: string | null) => void;
  onUpdateBlock?: (updated: BlockNode) => void;
  onUpdateContent?: (next: TabsBlockData) => void;
  // Metadata для стилизации
  metadata?: Record<string, unknown>;
  // Дочерние блоки для рендеринга
  blockTree?: BlockNode[];
}

const TabsBlock: React.FC<TabsBlockProps> = ({
  tabs = [],
  activeTab,
  editorMode = false,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
  onUpdateContent,
  metadata = {},
  blockTree = []
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

  // Находим блоки для текущей активной вкладки
  const activeTabBlocks = blockTree.filter(block =>
    (block.metadata as any)?.tabId === currentActiveTab
  );

  return (
    <section className="space-y-4" style={containerStyles}>
      {/* Вкладки */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-1" aria-label="Вкладки">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                px-3 py-2 text-sm font-medium rounded-t-lg transition-colors
                ${tab.id === currentActiveTab
                  ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800'
                }
              `}
            >
              {tab.title}
            </button>
          ))}
        </nav>
      </div>

      {/* Контент вкладки */}
      <div className="min-h-[200px]">
        {editorMode ? (
          // Режим редактора - показываем droppable зону
          <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
              Перетащите блоки сюда для вкладки "{tabs.find(t => t.id === currentActiveTab)?.title || 'Без названия'}"
            </p>
            {activeTabBlocks.map((block) => (
              <RenderBlockNode
                key={block.id}
                block={block}
                depth={0}
                editorMode={editorMode}
                selectedBlockId={selectedBlockId}
                onSelectBlock={onSelectBlock}
                onUpdateBlock={onUpdateBlock}
              />
            ))}
          </div>
        ) : (
          // Режим просмотра - рендерим блоки
          <div className="space-y-4">
            {activeTabBlocks.map((block) => (
              <RenderBlockNode
                key={block.id}
                block={block}
                depth={0}
                editorMode={false}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TabsBlock;