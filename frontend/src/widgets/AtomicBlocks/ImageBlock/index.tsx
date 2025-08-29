import React from 'react';

interface ImageBlockProps {
  imageUrl: string;
  altText: string;
}

const ImageBlock: React.FC<ImageBlockProps> = ({ imageUrl, altText }) => {
  if (!imageUrl) {
    return (
      <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">🖼️</div>
          <div className="text-sm">Добавьте URL изображения</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <img
        src={imageUrl}
        alt={altText || 'Изображение'}
        className="w-full h-auto rounded-lg shadow-sm"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="w-full h-48 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-center">
                <div class="text-center text-red-600 dark:text-red-400">
                  <div class="text-2xl mb-2">❌</div>
                  <div class="text-sm">Ошибка загрузки изображения</div>
                </div>
              </div>
            `;
          }
        }}
      />
    </div>
  );
};

export default ImageBlock;
