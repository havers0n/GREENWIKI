import React from 'react';
import { Typography, Button } from '@my-forum/ui';
import { useBlockNavigation } from '../model/useBlockNavigation';
import type { BlockNavigationProps } from '../types';

/**
 * Компонент для управления позицией блока
 * Позволяет перемещать блок влево/вправо
 */
const BlockNavigation: React.FC<BlockNavigationProps> = ({
  block,
  allBlocks,
  onMoveLeft,
  onMoveRight
}) => {
  const { canMoveLeft, canMoveRight } = useBlockNavigation(block, allBlocks);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
      <Typography as="h3" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Позиция блока
      </Typography>

      <div className="space-y-2">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Используйте клавиши стрелок для перемещения:
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            onClick={() => onMoveLeft?.(block.id)}
            disabled={!canMoveLeft(block)}
            variant="secondary"
            size="sm"
            className="flex-1"
          >
            ← Влево
          </Button>

          <Button
            onClick={() => onMoveRight?.(block.id)}
            disabled={!canMoveRight(block)}
            variant="secondary"
            size="sm"
            className="flex-1"
          >
            Вправо →
          </Button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
          <div>
            Или используйте <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">←</kbd> <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">→</kbd>
          </div>
          <div>
            Двойной клик по блоку для быстрого выбора
          </div>
        </div>
      </div>
    </div>
  );
};

BlockNavigation.displayName = 'BlockNavigation';

export { BlockNavigation };
export default BlockNavigation;
