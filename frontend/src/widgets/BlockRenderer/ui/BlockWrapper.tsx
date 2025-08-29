import React from 'react';

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
}

/**
 * Компонент-обертка для визуализации глубины вложенности блоков.
 * Добавляет отступы и соединительные линии в зависимости от уровня вложенности.
 */
export const BlockWrapper: React.FC<BlockWrapperProps> = ({
  depth,
  className,
  children,
  blockId,
  showDragHandle = false,
  onDragStart
}) => {
  // Рассчитываем отступ в зависимости от глубины
  const indentation = depth * 2; // 2rem на каждый уровень вложенности

  // Определяем стили для соединительной линии
  const hasConnectionLine = depth > 0;
  const connectionLineClass = hasConnectionLine
    ? 'border-l-2 border-l-blue-200 dark:border-l-blue-800'
    : '';

  const wrapperClassName = [
    'relative',
    // Основной отступ для вложенности
    `ml-${indentation}`,
    // Соединительная линия слева для дочерних блоков
    connectionLineClass,
    // Дополнительные стили для лучшей визуализации
    depth > 0 ? 'pl-4' : '', // Дополнительный padding-left для дочерних блоков
    // Фон для лучшей различимости уровней
    depth > 0 ? 'bg-gray-50/30 dark:bg-gray-800/30 rounded-l-md' : '',
    className || ''
  ].filter(Boolean).join(' ');

  return (
    <div
      className={wrapperClassName}
      data-block-id={blockId}
      data-depth={depth}
      style={{
        // Используем inline styles для динамического отступа
        marginLeft: `${indentation}rem`
      }}
    >
      {/* Иконка для перетаскивания */}
      {showDragHandle && (
        <div
          className="absolute -left-6 top-1/2 transform -translate-y-1/2 cursor-move opacity-50 hover:opacity-100 transition-opacity z-10"
          onMouseDown={onDragStart}
          title="Перетащить блок или использовать стрелки ← → для перемещения"
        >
          <div className="flex flex-col space-y-0.5">
            <div className="w-4 h-0.5 bg-gray-400 rounded"></div>
            <div className="w-4 h-0.5 bg-gray-400 rounded"></div>
            <div className="w-4 h-0.5 bg-gray-400 rounded"></div>
            <div className="w-4 h-0.5 bg-gray-400 rounded"></div>
            <div className="w-4 h-0.5 bg-gray-400 rounded"></div>
            <div className="w-4 h-0.5 bg-gray-400 rounded"></div>
          </div>
        </div>
      )}

      {/* Индикатор выбранного блока */}
      {blockId && (
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 z-10">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg"></div>
            <div className="w-1 h-6 bg-blue-500 rounded-full opacity-50"></div>
          </div>
        </div>
      )}

      {children}

      {/* Визуальный индикатор глубины для отладки */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -top-1 -left-1 text-xs text-gray-400 bg-white dark:bg-gray-900 px-1 rounded">
          {depth}
        </div>
      )}
    </div>
  );
};

export default BlockWrapper;
