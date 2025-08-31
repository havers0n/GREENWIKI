import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, Icon } from '@my-forum/ui';
import type { ReusableBlock } from '../../types/api';

interface BlockCardProps {
  block: ReusableBlock;
}

export const BlockCard: React.FC<BlockCardProps> = ({ block }) => {
  // Настраиваем draggable с уникальным ID
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `reusable-${block.id}`,
    data: {
      type: 'REUSABLE_BLOCK',
      block: block,
    },
  });

  // Стили для трансформации при перетаскивании
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`
        cursor-grab active:cursor-grabbing transition-all duration-200
        hover:shadow-lg hover:scale-105
        ${isDragging
          ? 'opacity-50 shadow-xl scale-105 rotate-3'
          : 'opacity-100'
        }
      `}
      {...listeners}
      {...attributes}
    >
      <div className="space-y-3">
        {/* Изображение превью */}
        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          {block.preview_image_url ? (
            <img
              src={block.preview_image_url}
              alt={block.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback если изображение не загрузилось
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center text-gray-400">
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  `;
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Icon name="image" className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Информация о блоке */}
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-1">
              {block.name}
            </h3>
            {block.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                {block.description}
              </p>
            )}
          </div>

          {/* Категория и статистика использования */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              {block.category && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {block.category}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <Icon name="eye" className="w-3 h-3" />
              <span>{block.usage_count}</span>
            </div>
          </div>
        </div>

        {/* Визуальный индикатор перетаскивания */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-2 py-1 rounded text-xs font-medium">
            Перетащить
          </div>
        </div>
      </div>
    </Card>
  );
};
