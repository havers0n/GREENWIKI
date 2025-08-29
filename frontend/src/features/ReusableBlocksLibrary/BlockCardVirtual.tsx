import React from 'react';
import type { ReusableBlockWithContent } from '../../../types/api';
import { BlockCard } from './BlockCard';

interface BlockCardVirtualProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    blocks: ReusableBlockWithContent[];
    columnCount: number;
  };
}

/**
 * Виртуализированный компонент для рендеринга блока в сетке
 * Используется с react-window для оптимизации производительности при большом количестве блоков
 */
export const BlockCardVirtual: React.FC<BlockCardVirtualProps> = ({
  columnIndex,
  rowIndex,
  style,
  data,
}) => {
  const { blocks, columnCount } = data;
  const index = rowIndex * columnCount + columnIndex;

  // Проверяем, что индекс валиден
  if (index >= blocks.length) {
    return null;
  }

  const block = blocks[index];

  return (
    <div style={style} className="p-2">
      <BlockCard block={block} />
    </div>
  );
};
