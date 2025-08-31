import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus, ArrowDown, Package, Type, Image, MousePointer } from 'lucide-react';

interface DropZoneProps {
  parentId: string | null;
  position: number;
  slotName?: string;
  className?: string;
  children?: React.ReactNode;
  isEmpty?: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({
  parentId,
  position,
  slotName = 'default',
  className = '',
  children,
  isEmpty = false
}) => {
  // Создаем уникальный ID для дроп-зоны
  const dropZoneId = `dropzone-${parentId || 'root'}-${position}-${slotName}`;

  const {
    setNodeRef,
    isOver,
    active
  } = useDroppable({
    id: dropZoneId,
    data: {
      type: 'dropzone',
      parentId,
      position,
      slotName
    }
  });

  // Определяем стили для дроп-зоны
  const baseStyles = `
    transition-all duration-300 ease-out
    border-2 border-dashed rounded-lg
    flex items-center justify-center
    backdrop-blur-sm
    ${isEmpty ? 'min-h-[80px] py-4' : 'min-h-[32px] py-2'}
  `;

  // Улучшенная подсветка с учетом типа перетаскиваемого блока
  const getHoverStyles = () => {
    if (isOver) {
      const blockType = active?.data?.current?.blockType;
      const intensity = blockType ? '500' : '400';

      return `
        border-blue-${intensity} bg-blue-50/90 dark:bg-blue-900/30
        scale-[1.02] shadow-lg shadow-blue-500/20
        animate-pulse
      `;
    }

    return `
      border-gray-300 dark:border-gray-600
      hover:border-blue-400 hover:bg-blue-50/70 dark:hover:bg-blue-900/20
      hover:scale-[1.01] hover:shadow-md
    `;
  };

  const hoverStyles = getHoverStyles();
  const isDraggingBlock = active?.data?.current?.type === 'block';
  const blockType = active?.data?.current?.blockType;
  const sourceType = active?.data?.current?.type;

  // Функция для получения иконки и описания на основе типа блока
  const getBlockInfo = () => {
    if (!blockType) return { icon: Package, label: 'Блок', colorClasses: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400', textSecondary: 'text-blue-500 dark:text-blue-400' } };

    const blockMap: Record<string, { icon: any; label: string; colorClasses: { bg: string; text: string; textSecondary: string } }> = {
      'heading': { 
        icon: Type, 
        label: 'Заголовок', 
        colorClasses: { 
          bg: 'bg-purple-100 dark:bg-purple-900/50', 
          text: 'text-purple-600 dark:text-purple-400',
          textSecondary: 'text-purple-500 dark:text-purple-400'
        }
      },
      'text': { 
        icon: Type, 
        label: 'Текст', 
        colorClasses: { 
          bg: 'bg-gray-100 dark:bg-gray-900/50', 
          text: 'text-gray-600 dark:text-gray-400',
          textSecondary: 'text-gray-500 dark:text-gray-400'
        }
      },
      'image': { 
        icon: Image, 
        label: 'Изображение', 
        colorClasses: { 
          bg: 'bg-green-100 dark:bg-green-900/50', 
          text: 'text-green-600 dark:text-green-400',
          textSecondary: 'text-green-500 dark:text-green-400'
        }
      },
      'button': { 
        icon: MousePointer, 
        label: 'Кнопка', 
        colorClasses: { 
          bg: 'bg-blue-100 dark:bg-blue-900/50', 
          text: 'text-blue-600 dark:text-blue-400',
          textSecondary: 'text-blue-500 dark:text-blue-400'
        }
      },
      'single_button': { 
        icon: MousePointer, 
        label: 'Кнопка', 
        colorClasses: { 
          bg: 'bg-blue-100 dark:bg-blue-900/50', 
          text: 'text-blue-600 dark:text-blue-400',
          textSecondary: 'text-blue-500 dark:text-blue-400'
        }
      },
      'container_section': { 
        icon: Package, 
        label: 'Контейнер', 
        colorClasses: { 
          bg: 'bg-orange-100 dark:bg-orange-900/50', 
          text: 'text-orange-600 dark:text-orange-400',
          textSecondary: 'text-orange-500 dark:text-orange-400'
        }
      },
      'container': { 
        icon: Package, 
        label: 'Контейнер', 
        colorClasses: { 
          bg: 'bg-orange-100 dark:bg-orange-900/50', 
          text: 'text-orange-600 dark:text-orange-400',
          textSecondary: 'text-orange-500 dark:text-orange-400'
        }
      },
    };

    return blockMap[blockType] || { icon: Package, label: 'Блок', colorClasses: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400', textSecondary: 'text-blue-500 dark:text-blue-400' } };
  };

  const { icon: BlockIcon, label: blockLabel, colorClasses } = getBlockInfo();

  // Определяем интенсивность анимации на основе близости к дроп-зоне
  const getAnimationIntensity = () => {
    if (!isDraggingBlock) return '';
    if (isOver) return 'animate-bounce';
    return 'animate-pulse';
  };

  return (
    <div
      ref={setNodeRef}
      className={`${baseStyles} ${hoverStyles} ${className} ${
        isDraggingBlock ? 'opacity-100' : 'opacity-60'
      } ${getAnimationIntensity()}`}
      data-dropzone-id={dropZoneId}
    >
      {children || (
        <div className={`flex items-center gap-2 transition-all duration-200 ${
          isOver
            ? 'text-blue-600 dark:text-blue-400 scale-105'
            : 'text-gray-400 dark:text-gray-500'
        }`}>
          {isEmpty ? (
            <>
              <div className={`p-2 rounded-full transition-all duration-200 ${
                isOver
                  ? colorClasses.bg
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}>
                {isOver && blockType ? (
                  <BlockIcon
                    className={`w-5 h-5 transition-all duration-200 scale-110 ${colorClasses.text}`}
                  />
                ) : (
                  <Plus
                    className={`w-5 h-5 transition-all duration-200 ${
                      isOver ? 'scale-110' : ''
                    }`}
                  />
                )}
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium">
                  {isOver ? `Разместить ${blockLabel.toLowerCase()}` : 'Перетащите блок сюда'}
                </span>
                {isOver && blockType && (
                  <span className={`text-xs ${colorClasses.textSecondary} mt-1 animate-pulse font-medium`}>
                    ⬇️ {blockLabel} будет добавлен здесь
                  </span>
                )}
                {!isOver && isDraggingBlock && (
                  <span className="text-xs text-gray-400 mt-1 animate-pulse">
                    ✨ Готово к размещению
                  </span>
                )}
              </div>
              
              {/* Дополнительные направляющие для улучшения UX */}
              {isOver && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1">
                    <ArrowDown className="w-4 h-4 text-blue-500 animate-bounce" />
                  </div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1">
                    <ArrowDown className="w-4 h-4 text-blue-500 animate-bounce rotate-180" />
                  </div>
                </div>
              )}
            </>
          ) : (
            // Компактная линия-разделитель между блоками
            <div className="w-full relative">
              <div className={`w-full transition-all duration-200 ${
                isOver
                  ? 'h-1 bg-blue-400 shadow-lg rounded-full'
                  : 'h-px bg-gray-300 dark:bg-gray-600'
              }`}></div>
              
              {/* Индикатор позиции при hover */}
              {isOver && (
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="flex items-center gap-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg whitespace-nowrap">
                    <BlockIcon className="w-3 h-3" />
                    <span>{blockLabel}</span>
                  </div>
                </div>
              )}

              {/* Тонкие направляющие линии */}
              {isDraggingBlock && !isOver && (
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full h-px bg-blue-300/50 dark:bg-blue-600/50 animate-pulse"></div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DropZone;
