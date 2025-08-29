import React, { useState } from 'react';
import { GripVertical, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '../../../shared/lib/utils';

interface BlockWrapperProps {
  /** Уровень вложенности блока */
  depth: number;
  /** Дополнительные CSS классы */
  className?: string;
  /** Содержимое блока */
  children: React.ReactNode;
  /** ID блока для атрибутов */
  blockId?: string;
  /** Показывать ли иконку для перетаскивания */
  showDragHandle?: boolean;
  /** Обработчик начала перетаскивания */
  onDragStart?: () => void;
  /** Является ли блок контейнером (может содержать дочерние блоки) */
  isContainer?: boolean;
  /** Есть ли дочерние блоки */
  hasChildren?: boolean;
  /** Развернут ли контейнер */
  isExpanded?: boolean;
  /** Обработчик переключения развернутости */
  onToggleExpanded?: () => void;
  /** Обработчик добавления дочернего блока */
  onAddChild?: (slot?: string) => void;
  /** Доступные слоты для этого блока */
  availableSlots?: string[];
  /** Текущий слот */
  currentSlot?: string;
}

/**
 * Улучшенный компонент-обертка для визуализации блоков с поддержкой:
 * - Визуальной вложенности и контейнеров
 * - Слотов для разных областей
 * - Drag & drop зон для дочерних блоков
 * - Сворачивания/разворачивания контейнеров
 */
export const BlockWrapper: React.FC<BlockWrapperProps> = ({
  depth,
  className,
  children,
  blockId,
  showDragHandle = false,
  onDragStart,
  isContainer = false,
  hasChildren = false,
  isExpanded = true,
  onToggleExpanded,
  onAddChild,
  availableSlots = [],
  currentSlot
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Создаем drop zone для дочерних блоков
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `container-${blockId || 'root'}`,
    data: {
      type: 'container',
      blockId,
      accepts: ['block']
    }
  });

  // Рассчитываем отступы
  const baseIndentation = depth * 16; // 16px на уровень
  const containerPadding = isContainer ? 12 : 0;

  // Стили для разных типов блоков
  const getBlockStyles = () => {
    const baseStyles = {
      marginLeft: `${baseIndentation}px`,
      position: 'relative' as const,
    };

    if (isContainer) {
      return {
        ...baseStyles,
        padding: `${containerPadding}px`,
        border: '1px solid',
        borderColor: isOver ? 'rgb(59 130 246)' : 'rgb(229 231 235)',
        borderRadius: '6px',
        backgroundColor: isOver ? 'rgb(239 246 255)' : 'rgb(249 250 251)',
        transition: 'all 0.2s ease-in-out',
      };
    }

    return baseStyles;
  };

  const blockStyles = getBlockStyles();

  return (
    <div
      ref={isContainer ? setDropRef : undefined}
      className={cn(
        'group relative transition-all duration-200',
        isContainer && 'min-h-[60px]',
        className
      )}
      style={blockStyles}
      data-block-id={blockId}
      data-depth={depth}
      data-container={isContainer ? 'true' : 'false'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header контейнера */}
      {isContainer && (
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {/* Кнопка сворачивания/разворачивания */}
            {hasChildren && (
              <button
                onClick={onToggleExpanded}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title={isExpanded ? 'Свернуть контейнер' : 'Развернуть контейнер'}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                )}
              </button>
            )}

            {/* Иконка контейнера */}
            <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Контейнер
            </div>

            {/* Индикатор слота */}
            {currentSlot && (
              <div className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded">
                Слот: {currentSlot}
              </div>
            )}
          </div>

          {/* Кнопки действий */}
          <div className={cn(
            'flex items-center gap-1 transition-opacity',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}>
            {/* Кнопка добавления дочернего блока */}
            {onAddChild && (
              <button
                onClick={() => onAddChild()}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Добавить дочерний блок"
              >
                <Plus className="h-4 w-4 text-gray-600" />
              </button>
            )}

            {/* Иконка перетаскивания */}
            {showDragHandle && (
              <div
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-move transition-colors"
                onMouseDown={onDragStart}
                title="Перетащить контейнер"
              >
                <GripVertical className="h-4 w-4 text-gray-600" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drop zone индикатор */}
      {isContainer && isOver && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded flex items-center justify-center">
          <div className="text-blue-600 dark:text-blue-400 font-medium">
            Перетащите блок сюда
          </div>
        </div>
      )}

      {/* Слоты для контейнера */}
      {isContainer && availableSlots.length > 0 && (
        <div className="space-y-2 mb-2">
          {availableSlots.map(slotName => (
            <SlotDropZone
              key={slotName}
              slotName={slotName}
              isActive={isExpanded}
              onAddBlock={() => onAddChild?.(slotName)}
            />
          ))}
        </div>
      )}

      {/* Содержимое блока */}
      <div className={cn(
        'transition-all duration-200',
        isContainer && !isExpanded && 'hidden'
      )}>
        {children}
      </div>

      {/* Drag handle для обычных блоков */}
      {!isContainer && showDragHandle && (
        <div
          className={cn(
            'absolute -left-6 top-1/2 transform -translate-y-1/2 cursor-move z-10 transition-opacity',
            isHovered ? 'opacity-100' : 'opacity-50'
          )}
          onMouseDown={onDragStart}
          title="Перетащить блок"
        >
          <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
        </div>
      )}

      {/* Индикатор выбранного блока */}
      {blockId && isHovered && (
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 z-10">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg"></div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Компонент для отображения слота внутри контейнера
 */
interface SlotDropZoneProps {
  slotName: string;
  isActive: boolean;
  onAddBlock: () => void;
}

const SlotDropZone: React.FC<SlotDropZoneProps> = ({ slotName, isActive, onAddBlock }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${slotName}`,
    data: {
      type: 'slot',
      slotName,
      accepts: ['block']
    }
  });

  if (!isActive) return null;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200',
        isOver
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
      )}
    >
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        Слот: {slotName}
      </div>
      <button
        onClick={onAddBlock}
        className="inline-flex items-center gap-2 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
      >
        <Plus className="h-4 w-4" />
        Добавить блок
      </button>
    </div>
  );
};

export default BlockWrapper;
