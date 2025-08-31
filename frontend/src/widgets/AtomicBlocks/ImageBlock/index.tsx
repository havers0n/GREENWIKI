import React from 'react';

interface ImageBlockProps {
  imageUrl: string;
  altText: string;
  editorMode?: boolean;
  metadata?: Record<string, unknown>;
}

const ImageBlock: React.FC<ImageBlockProps> = ({ imageUrl, altText, editorMode = false, metadata = {} }) => {
  const isEmpty = !imageUrl || imageUrl.trim().length === 0;

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
    }

    return styles;
  };

  const customStyles = generateStyles();

  if (isEmpty) {
    const placeholderClasses = editorMode ? [
      'w-full h-48 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center transition-all duration-200',
      'hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
    ].join(' ') : 'w-full h-48 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center';

    return (
      <div className={placeholderClasses} style={customStyles}>
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">🖼️</div>
          <div className="text-sm font-medium">
            {editorMode ? 'Нажмите для добавления изображения' : 'Добавьте URL изображения'}
          </div>
          {editorMode && (
            <div className="text-xs mt-1 text-gray-400">
              Настройте URL в инспекторе →
            </div>
          )}
        </div>
      </div>
    );
  }

  // Дополнительные классы для режима редактора
  const containerClasses = editorMode ? [
    'w-full transition-all duration-200 rounded-lg',
    'hover:ring-2 hover:ring-blue-300 hover:ring-opacity-50'
  ].join(' ') : 'w-full';

  return (
    <div className={containerClasses} style={customStyles}>
      <img
        src={imageUrl}
        alt={altText || 'Изображение'}
        className={`w-full h-auto rounded-lg shadow-sm ${editorMode ? 'select-none' : ''}`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="w-full h-48 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-center">
                <div class="text-center text-red-600 dark:text-red-400">
                  <div class="text-2xl mb-2">❌</div>
                  <div class="text-sm font-medium">Ошибка загрузки изображения</div>
                  ${editorMode ? '<div class="text-xs mt-1">Проверьте URL в инспекторе</div>' : ''}
                </div>
              </div>
            `;
          }
        }}
        onLoad={() => {
          // Добавляем индикатор загруженного изображения в режиме редактора
          if (editorMode) {
            console.log('✅ Изображение успешно загружено:', imageUrl);
          }
        }}
      />
      {editorMode && (
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          🖼️ Изображение
        </div>
      )}
    </div>
  );
};

export default ImageBlock;
