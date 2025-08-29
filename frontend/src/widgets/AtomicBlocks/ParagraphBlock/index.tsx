import React from 'react';

interface ParagraphBlockProps {
  text: string;
}

const ParagraphBlock: React.FC<ParagraphBlockProps> = ({ text }) => {
  // Простая обработка Markdown для базовых тегов
  const processMarkdown = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold**
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // *italic*
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>') // `code`
      .replace(/\n/g, '<br />'); // новые строки
  };

  return (
    <div 
      className="text-gray-700 dark:text-gray-300 leading-relaxed"
      dangerouslySetInnerHTML={{ 
        __html: processMarkdown(text || 'Введите текст параграфа...') 
      }}
    />
  );
};

export default ParagraphBlock;
