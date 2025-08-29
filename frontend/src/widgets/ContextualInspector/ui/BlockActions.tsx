import React from 'react';
import { Typography, Button, Spinner } from '../../../shared/ui/atoms';
import type { BlockActionsProps } from '../types';

/**
 * Компонент для действий с блоком
 * Содержит кнопки удаления и публикации
 */
const BlockActions: React.FC<BlockActionsProps> = ({
  block,
  onBlockDelete,
  onPublishToggle,
  publishing = false
}) => {
  return (
    <>
      {/* Панель удаления */}
      {onBlockDelete && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <Typography as="h3" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Управление блоком
          </Typography>

          <Button
            onClick={() => onBlockDelete(block.id)}
            variant="danger"
            className="w-full"
          >
            🗑️ Удалить блок
          </Button>
        </div>
      )}

      {/* Панель публикации */}
      {onPublishToggle && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <Typography as="h3" className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Публикация
          </Typography>

          <Button
            onClick={() => onPublishToggle(block.id)}
            disabled={publishing}
            variant={block.status === 'published' ? 'secondary' : 'primary'}
            className="w-full"
          >
            {publishing ? (
              <>
                <Spinner className="w-4 h-4 mr-1" />
                Применение…
              </>
            ) : block.status === 'published' ? (
              'Снять с публикации'
            ) : (
              'Опубликовать'
            )}
          </Button>
        </div>
      )}
    </>
  );
};

BlockActions.displayName = 'BlockActions';

export { BlockActions };
export default BlockActions;
