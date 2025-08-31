import React from 'react';
import DOMPurify from 'dompurify';

interface ParagraphBlockProps {
  text: string;
  editorMode?: boolean;
  metadata?: Record<string, unknown>;
}

const ParagraphBlock: React.FC<ParagraphBlockProps> = ({ text, editorMode = false, metadata = {} }) => {
  // Безопасная обработка Markdown для базовых тегов с санитизацией
  const processMarkdown = (content: string) => {
    const processed = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold**
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // *italic*
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>') // `code`
      .replace(/\n/g, '<br />'); // новые строки

    // Санитизация HTML с разрешением только безопасных тегов
    return DOMPurify.sanitize(processed, {
      ALLOWED_TAGS: ['strong', 'em', 'code', 'br'],
      ALLOWED_ATTR: ['class']
    });
  };

  const isEmpty = !text || text.trim().length === 0;
  const displayText = text || 'Введите текст параграфа...';

  // Генерация стилей из metadata
  const generateStyles = () => {
    const styles: React.CSSProperties = {};

    // Spacing
    const spacing = metadata.spacing as Record<string, string> | undefined;
    if (spacing) {
      if (spacing.marginTop) styles.marginTop = spacing.marginTop;
      if (spacing.marginRight) styles.marginRight = spacing.marginRight;
      if (spacing.marginBottom) styles.marginBottom = spacing.marginBottom;
      if (spacing.marginLeft) styles.marginLeft = spacing.marginLeft;
      if (spacing.paddingTop) styles.paddingTop = spacing.paddingTop;
      if (spacing.paddingRight) styles.paddingRight = spacing.paddingRight;
      if (spacing.paddingBottom) styles.paddingBottom = spacing.paddingBottom;
      if (spacing.paddingLeft) styles.paddingLeft = spacing.paddingLeft;
    }

    // Text color
    const textColor = metadata.textColor as string | undefined;
    if (textColor) {
      styles.color = textColor;
    }

    return styles;
  };

  const customStyles = generateStyles();

  // Классы для режима редактора
  const editorClasses = editorMode ? [
    'min-h-[1.5rem] p-2 rounded-md transition-all duration-200',
    isEmpty ? 'border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50' : '',
    isEmpty ? 'hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20' : ''
  ].filter(Boolean).join(' ') : '';

  const textClasses = [
    'text-gray-700 dark:text-gray-300 leading-relaxed',
    isEmpty && editorMode ? 'text-gray-500 dark:text-gray-400 italic' : '',
    editorClasses
  ].filter(Boolean).join(' ');

  if (editorMode && isEmpty) {
    return (
      <div 
        className={textClasses}
        style={customStyles}
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-400">📝</span>
          <span>{displayText}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={textClasses}
      style={customStyles}
      dangerouslySetInnerHTML={{ 
        __html: processMarkdown(displayText) 
      }}
    />
  );
};

export default ParagraphBlock;
