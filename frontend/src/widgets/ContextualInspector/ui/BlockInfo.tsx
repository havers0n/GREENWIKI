import React from 'react';
import type { BlockInfoProps } from '../types';

/**
 * Компонент для отображения информации о блоке
 * Показывает позицию, статус и слот блока
 */
const BlockInfo: React.FC<BlockInfoProps> = ({
  block,
  statusInfo
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">Позиция:</span>
        <span>#{block.position}</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">Статус:</span>
        <span className={statusInfo.color}>
          {statusInfo.icon} {statusInfo.text}
        </span>
      </div>

      {block.parent_block_id && block.slot && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Слот:</span>
          <span className="text-purple-600 dark:text-purple-400">
            {block.slot}
          </span>
        </div>
      )}
    </div>
  );
};

BlockInfo.displayName = 'BlockInfo';

export { BlockInfo };
export default BlockInfo;
