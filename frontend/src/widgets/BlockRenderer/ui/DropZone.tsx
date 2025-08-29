import React from 'react';
import { useDroppable } from '@dnd-kit/core';

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
    transition-all duration-200 ease-in-out
    border-2 border-dashed
    flex items-center justify-center
    min-h-[40px] rounded-md
    ${isEmpty ? 'min-h-[80px]' : 'min-h-[20px]'}
  `;

  const hoverStyles = isOver
    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10';

  const isDraggingBlock = active?.data?.current?.type === 'block';

  return (
    <div
      ref={setNodeRef}
      className={`${baseStyles} ${hoverStyles} ${className} ${isDraggingBlock ? 'opacity-100' : 'opacity-50'}`}
      data-dropzone-id={dropZoneId}
    >
      {children || (
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
          {isEmpty ? (
            <>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="text-sm font-medium">
                Перетащите блок сюда
              </span>
            </>
          ) : (
            <div className="w-full h-px bg-gray-300 dark:bg-gray-600"></div>
          )}
        </div>
      )}
    </div>
  );
};

export default DropZone;
