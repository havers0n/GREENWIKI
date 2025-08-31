import React, { useState } from 'react';
import { GripVertical, Plus } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '../../../shared/lib/utils';

interface BlockWrapperProps {
  depth?: number;
  className?: string;
  children?: React.ReactNode;
  blockId?: string;
  blockType?: string;
  showDragHandle?: boolean;
  onDragStart?: () => void;
  isContainer?: boolean;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  onAddChild?: (slot?: string) => void;
  availableSlots?: string[];
  currentSlot?: string;
  dragListeners?: Record<string, any>;
  dragAttributes?: Record<string, any>;
  dragStyle?: React.CSSProperties;
  isDragging?: boolean;
  dragRef?: React.Ref<HTMLDivElement>;
}

interface SlotDropZoneProps {
  slotName: string;
  isActive: boolean;
  onAddBlock: () => void;
}

function BlockWrapperComponent(props: BlockWrapperProps, ref: React.Ref<HTMLDivElement>) {
  const depth = props.depth || 0;
  const className = props.className;
  const children = props.children;
  const blockId = props.blockId;
  const showDragHandle = props.showDragHandle || false;
  const isContainer = props.isContainer || false;
  const hasChildren = props.hasChildren || false;
  const isExpanded = props.isExpanded !== undefined ? props.isExpanded : true;
  const availableSlots = props.availableSlots || [];
  const dragRef = props.dragRef;
  const dragListeners = props.dragListeners;
  const dragAttributes = props.dragAttributes;
  const dragStyle = props.dragStyle;
  const isDragging = props.isDragging;
  const [isHovered, setIsHovered] = useState(false);

  // Функция для объединения ref'ов
  const mergeRefs = (...refs: (React.Ref<HTMLDivElement> | undefined)[]) => {
    return (node: HTMLDivElement | null) => {
      refs.forEach((refFunc) => {
        if (typeof refFunc === 'function') {
          refFunc(node);
        } else if (refFunc && 'current' in refFunc) {
          (refFunc as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      });
    };
  };

  return (
    <div
      ref={mergeRefs(ref, dragRef)}
      className={cn(
        'group relative transition-all duration-200',
        // Визуальная иерархия для вложенных блоков
        depth > 0 && [
          'ml-6 pl-4 border-l-2 border-blue-200 dark:border-blue-800',
          'before:absolute before:left-0 before:top-4 before:w-4 before:h-0.5',
          'before:bg-blue-400 dark:before:bg-blue-600 before:-translate-x-1',
          'bg-gradient-to-r from-blue-50/30 to-transparent dark:from-blue-900/10',
        ],
        // Добавляем стили для состояния перетаскивания
        isDragging && 'opacity-50 transform scale-95 dragging',
        className
      )}
      style={{
        marginLeft: depth === 0 ? 0 : `${depth * 24}px`,
        ...dragStyle
      }}
      {...dragListeners}
      {...dragAttributes}
    >
      {/* Декоративная линия-связка для дочерних блоков */}
      {depth > 0 && (
        <div className="absolute -left-1 top-3 w-3 h-3 rounded-full border-2 border-blue-400 dark:border-blue-600 bg-white dark:bg-gray-800" />
      )}

      {/* Индикатор глубины для отладки (можно убрать в продакшене) */}
      {process.env.NODE_ENV === 'development' && depth > 0 && (
        <div className="absolute -left-8 top-1 text-xs text-gray-400 font-mono">
          {depth}
        </div>
      )}

      {children}
    </div>
  );
}

function SlotDropZone(props: SlotDropZoneProps) {
  const slotName = props.slotName;
  const isActive = props.isActive;
  const onAddBlock = props.onAddBlock;

  if (!isActive) {
    return null;
  }

  const droppableResult = useDroppable({
    id: `slot-${slotName}`,
    data: {
      type: 'slot',
      slotName: slotName,
      accepts: ['block']
    }
  });

  const setNodeRef = droppableResult.setNodeRef;
  const isOver = droppableResult.isOver;

  return React.createElement(
    'div',
    {
      ref: setNodeRef,
      className: cn(
        'min-h-[40px] border-2 border-dashed border-gray-300 rounded-md p-2 flex items-center justify-center transition-colors',
        isOver ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
      )
    },
    React.createElement(
      'button',
      {
        onClick: onAddBlock,
        className: 'inline-flex items-center gap-2 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors'
      },
      React.createElement(Plus, { className: 'h-4 w-4' }),
      'Добавить блок'
    )
  );
}

const BlockWrapper = React.forwardRef(BlockWrapperComponent);

BlockWrapper.displayName = 'BlockWrapper';

export default BlockWrapper;