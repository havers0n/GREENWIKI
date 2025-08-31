import React from 'react';

interface HeadingBlockProps {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  align: 'left' | 'center' | 'right';
  metadata?: Record<string, unknown>;
  editorMode?: boolean;
}

const HeadingBlock: React.FC<HeadingBlockProps> = ({ text, level, align, metadata = {}, editorMode = false }) => {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  const levelStyles = {
    1: 'text-4xl font-bold',
    2: 'text-3xl font-bold',
    3: 'text-2xl font-semibold',
    4: 'text-xl font-semibold',
    5: 'text-lg font-medium',
    6: 'text-base font-medium',
  }[level];

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

  const headingStyles = generateStyles();
  const isEmpty = !text || text.trim().length === 0;
  const displayText = text || 'Новый заголовок';

  // Классы для режима редактора
  const editorClasses = editorMode ? [
    'min-h-[1.2em] px-2 py-1 rounded-md transition-all duration-200',
    isEmpty ? 'border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50' : '',
    isEmpty ? 'hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20' : ''
  ].filter(Boolean).join(' ') : '';

  const textClasses = [
    levelStyles,
    alignClass,
    'text-gray-900 dark:text-gray-100',
    isEmpty && editorMode ? 'text-gray-500 dark:text-gray-400 italic' : '',
    editorClasses
  ].filter(Boolean).join(' ');

  if (editorMode && isEmpty) {
    return (
      <Tag
        className={textClasses}
        style={headingStyles}
      >
        <div className="flex items-center gap-2">
          <span className="text-gray-400">
            {level === 1 ? '📍' : level === 2 ? '📌' : '📝'}
          </span>
          <span>{displayText}</span>
        </div>
      </Tag>
    );
  }

  return (
    <Tag
      className={textClasses}
      style={headingStyles}
    >
      {displayText}
    </Tag>
  );
};

export default HeadingBlock;
