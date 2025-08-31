import React from 'react';
import { cn } from '../../../shared/lib/utils';

interface BlockWrapperProps {
  depth?: number;
  className?: string;
  children?: React.ReactNode;
  blockType?: string;
  onDragStart?: () => void;
  onToggleExpanded?: () => void;
  onAddChild?: (slot?: string) => void;
  currentSlot?: string;
  dragListeners?: Record<string, any>;
  dragAttributes?: Record<string, any>;
  dragStyle?: React.CSSProperties;
  isDragging?: boolean;
  dragRef?: React.Ref<HTMLDivElement>;
}



function BlockWrapperComponent(props: BlockWrapperProps, ref: React.Ref<HTMLDivElement>) {
  const depth = props.depth || 0;
  const className = props.className;
  const children = props.children;

  const dragRef = props.dragRef;
  const dragListeners = props.dragListeners;
  const dragAttributes = props.dragAttributes;
  const dragStyle = props.dragStyle;
  const isDragging = props.isDragging;


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



const BlockWrapper = React.forwardRef(BlockWrapperComponent);

BlockWrapper.displayName = 'BlockWrapper';

export default BlockWrapper;