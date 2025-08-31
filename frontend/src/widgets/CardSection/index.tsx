import React from 'react';
import RenderBlockNode from 'widgets/BlockRenderer/ui/RenderBlockNode';
import type { BlockNode } from '../../types/api';

interface CardSectionProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  showHeader?: boolean;
  showFooter?: boolean;

  // Props для редактора
  editorMode?: boolean;
  allBlocks?: BlockNode[];
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string | null) => void;
  onUpdateBlock?: (block: BlockNode) => void;

  // Дочерние блоки для рендеринга
  blockTree?: BlockNode[];
}

/**
 * Блок-карточка с возможностью вложения других блоков
 * Поддерживает заголовок, контент и футер
 */
const CardSection: React.FC<CardSectionProps> = ({
  title,
  description,
  variant = 'default',
  size = 'medium',
  showHeader = true,
  showFooter = false,

  // Editor props
  editorMode = false,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
  blockTree = [],
}) => {
  // Получаем дочерние блоки для разных слотов
  const getSlotBlocks = (slotName: string) =>
    blockTree.filter(block => block.slot === slotName);

  const headerBlocks = getSlotBlocks('header');
  const contentBlocks = getSlotBlocks('content');
  const footerBlocks = getSlotBlocks('footer');

  // Стили карточки
  const cardClasses = [
    'rounded-lg border transition-shadow duration-200',
    // Варианты
    {
      default: 'border-gray-200 bg-white shadow-sm',
      elevated: 'border-gray-200 bg-white shadow-lg hover:shadow-xl',
      outlined: 'border-gray-300 bg-transparent',
      filled: 'border-transparent bg-gray-50',
    }[variant],
    // Размеры
    {
      small: 'p-3',
      medium: 'p-4',
      large: 'p-6',
    }[size],
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      {/* Header */}
      {(showHeader || headerBlocks.length > 0) && (
        <div className="mb-4 pb-3 border-b border-gray-100">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {title}
            </h3>
          )}

          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}

          {editorMode && headerBlocks.length === 0 && (
            <div className="mt-2 p-2 border-2 border-dashed border-gray-300 rounded text-center text-gray-500 text-sm">
              Заголовок карточки (перетащите блоки сюда)
            </div>
          )}

          {/* Блоки заголовка */}
          {headerBlocks.length > 0 && (
            <div className="mt-3">
              {headerBlocks.map(block => (
                <RenderBlockNode
                  key={block.id}
                  block={block}
                  depth={0}
                  editorMode={editorMode}
                  selectedBlockId={selectedBlockId ?? undefined}
                  onSelectBlock={onSelectBlock}
                  onUpdateBlock={onUpdateBlock}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1">
        {editorMode && contentBlocks.length === 0 && (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded text-center text-gray-500">
            <div className="text-2xl mb-2">📄</div>
            <p>Основной контент карточки</p>
            <p className="text-sm">Перетащите блоки сюда</p>
          </div>
        )}

        {/* Блоки контента */}
        {contentBlocks.length > 0 && (
          <div>
            {contentBlocks.map(block => (
              <RenderBlockNode
                key={block.id}
                block={block}
                depth={0}
                editorMode={editorMode}
                selectedBlockId={selectedBlockId ?? undefined}
                onSelectBlock={onSelectBlock}
                onUpdateBlock={onUpdateBlock}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {(showFooter || footerBlocks.length > 0) && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          {editorMode && footerBlocks.length === 0 && (
            <div className="p-2 border-2 border-dashed border-gray-300 rounded text-center text-gray-500 text-sm">
              Футер карточки (перетащите блоки сюда)
            </div>
          )}

          {/* Блоки футера */}
          {footerBlocks.length > 0 && (
            <div>
              {footerBlocks.map(block => (
                <RenderBlockNode
                  key={block.id}
                  block={block}
                  depth={0}
                  editorMode={editorMode}
                  selectedBlockId={selectedBlockId ?? undefined}
                  onSelectBlock={onSelectBlock}
                  onUpdateBlock={onUpdateBlock}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { CardSection };
export default CardSection;
