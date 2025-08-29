import React from 'react';
import { BlockRenderer } from 'widgets/BlockRenderer';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  textColor?: string;
  height?: 'small' | 'medium' | 'large' | 'full';
  alignment?: 'left' | 'center' | 'right';
  overlay?: boolean;
  overlayOpacity?: number;

  // Props для редактора
  editorMode?: boolean;
  blockId?: string;
  allBlocks?: any[];
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string | null) => void;
  onUpdateBlock?: (block: any) => void;
  onUpdateContent?: (content: any) => void;
}

/**
 * Hero-секция с поддержкой вложенных блоков
 * Может содержать заголовок, подзаголовок, кнопки и другие элементы
 */
const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  backgroundImage,
  backgroundColor = '#f8f9fa',
  textColor = '#212529',
  height = 'medium',
  alignment = 'center',
  overlay = false,
  overlayOpacity = 0.5,

  // Editor props
  editorMode = false,
  blockId,
  allBlocks = [],
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
  onUpdateContent,
}) => {
  // Получаем дочерние блоки
  const childBlocks = allBlocks.filter(block =>
    block.parent_block_id === blockId && (!block.slot || block.slot === 'content')
  );

  // Стили hero-секции
  const heroStyles: React.CSSProperties = {
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
    backgroundColor: backgroundColor,
    color: textColor,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
    minHeight: {
      small: '200px',
      medium: '400px',
      large: '600px',
      full: '100vh',
    }[height],
  };

  const contentStyles: React.CSSProperties = {
    textAlign: alignment,
    position: 'relative',
    zIndex: 2,
  };

  const overlayStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  };

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <section
      className="relative overflow-hidden"
      style={heroStyles}
    >
      {/* Overlay */}
      {overlay && <div style={overlayStyles} />}

      {/* Content */}
      <div
        className={`container mx-auto px-4 py-16 flex flex-col justify-center items-center min-h-full ${alignmentClasses[alignment]}`}
        style={contentStyles}
      >
        {/* Дефолтный контент */}
        {title && (
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-inherit">
            {title}
          </h1>
        )}

        {subtitle && (
          <p className="text-xl md:text-2xl mb-8 text-inherit opacity-90 max-w-2xl">
            {subtitle}
          </p>
        )}

        {/* Вложенные блоки */}
        {editorMode ? (
          <>
            {childBlocks.length === 0 && (
              <div className="mt-8 p-8 border-2 border-dashed border-white/30 rounded-lg text-center text-white/70">
                <div className="text-4xl mb-4">🎯</div>
                <p>Hero-секция</p>
                <p className="text-sm">Перетащите блоки сюда для добавления контента</p>
              </div>
            )}

            <BlockRenderer
              blockTree={childBlocks || []}
              editorMode={editorMode}
              selectedBlockId={selectedBlockId}
              onSelectBlock={onSelectBlock}
              onUpdateBlock={onUpdateBlock}
              parentBlockId={blockId}
              slot="content"
            />
          </>
        ) : (
          // В режиме просмотра рендерим дочерние блоки
          childBlocks.map(block => (
            <div key={block.id} className="hero-child">
              {/* Здесь должен быть рендерер для конкретного типа блока */}
              <div className="p-4">
                <pre className="text-sm text-gray-300">
                  {JSON.stringify(block.content, null, 2)}
                </pre>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export { HeroSection };
export default HeroSection;
