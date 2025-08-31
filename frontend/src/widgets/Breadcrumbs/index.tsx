import React from 'react';
import { Button } from '@my-forum/ui';
import type { Database } from '@my-forum/db-types';
import { blockRegistry } from '../../shared/config/blockRegistry';
import { getBlockPath } from '../../store/slices/treeUtils';
import type { BlockNode } from '../../types/api';

type LayoutBlock = Database['public']['Tables']['layout_blocks']['Row'];

interface BreadcrumbItem {
  id: string;
  name: string;
  type: string;
}

interface BreadcrumbsProps {
  /** Текущий выбранный блок (BlockNode или LayoutBlock) */
  selectedBlock: BlockNode | LayoutBlock | null;
  /** Все блоки страницы для построения иерархии */
  allBlocks: (BlockNode | LayoutBlock)[];
  /** Обработчик выбора блока */
  onSelectBlock: (blockId: string | null) => void;
  /** Показывать ли компонент */
  visible?: boolean;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  selectedBlock,
  allBlocks,
  onSelectBlock,
  visible = true,
}) => {
  // Строим цепочку предков для выбранного блока
  const buildBreadcrumbChain = (block: BlockNode | LayoutBlock | null): BreadcrumbItem[] => {
    if (!block) return [];

    // Если это BlockNode, используем новую утилитарную функцию
    if ('depth' in block && 'children' in block) {
      const path = getBlockPath(allBlocks as BlockNode[], block.id);
      const chain: BreadcrumbItem[] = [];

      // Преобразуем путь в формат BreadcrumbItem
      path.forEach((pathBlock, index) => {
        if (index === 0) {
          // Первый элемент - корень
          chain.push({
            id: 'root',
            name: 'Страница',
            type: 'root',
          });
        } else {
          const spec = blockRegistry[pathBlock.block_type];
          chain.push({
            id: pathBlock.id,
            name: spec?.name || pathBlock.block_type,
            type: pathBlock.block_type,
          });
        }
      });

      return chain;
    }

    // Для LayoutBlock используем старую логику
    const chain: BreadcrumbItem[] = [];
    let currentBlock: LayoutBlock | undefined = block as LayoutBlock;

    // Добавляем текущий блок
    const spec = blockRegistry[currentBlock.block_type];
    chain.unshift({
      id: currentBlock.id,
      name: spec?.name || currentBlock.block_type,
      type: currentBlock.block_type,
    });

    // Проходим по цепочке предков
    while (currentBlock?.parent_block_id) {
      const parentBlock = allBlocks.find(b => b.id === currentBlock!.parent_block_id);
      if (!parentBlock) break;

      const parentSpec = blockRegistry[parentBlock.block_type];
      chain.unshift({
        id: parentBlock.id,
        name: parentSpec?.name || parentBlock.block_type,
        type: parentBlock.block_type,
      });

      currentBlock = parentBlock as LayoutBlock;
    }

    // Добавляем корень
    chain.unshift({
      id: 'root',
      name: 'Страница',
      type: 'root',
    });

    return chain;
  };

  if (!visible || !selectedBlock) {
    return null;
  }

  const breadcrumbChain = buildBreadcrumbChain(selectedBlock);

  // Получаем иконку для типа блока
  const getBlockIcon = (blockType: string) => {
    switch (blockType) {
      case 'root': return '🏠';
      case 'container_section': return '📦';
      case 'single_button': return '🔘';
      case 'heading': return '📰';
      case 'paragraph': return '📄';
      case 'tabs': return '📑';
      case 'accordion': return '📋';
      case 'categories_section': return '📁';
      case 'controls_section': return '⚙️';
      case 'properties_section': return '🏢';
      case 'animations_section': return '🎬';
      case 'changelog_section': return '📝';
      case 'single_image': return '🖼️';
      case 'spacer': return '📏';
      case 'button_group': return '🔘';
      case 'section_block': return '📦';
      case 'button_block': return '🔘';
      case 'heading_block': return '📰';
      case 'paragraph_block': return '📄';
      case 'image_block': return '🖼️';
      case 'icon_block': return '⭐';
      default: return '📄';
    }
  };

  return (
    <div className="flex items-center gap-1 text-sm bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700">
      <span className="text-gray-500 dark:text-gray-400 mr-1">📍</span>
      {breadcrumbChain.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && (
            <span className="text-gray-400 dark:text-gray-500 mx-1">/</span>
          )}
          <Button
            variant={index === breadcrumbChain.length - 1 ? 'secondary' : 'ghost'}
            size="xs"
            onClick={() => onSelectBlock(item.id === 'root' ? null : item.id)}
            className={`flex items-center gap-1 ${
              index === breadcrumbChain.length - 1
                ? 'font-semibold text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
            disabled={index === breadcrumbChain.length - 1}
          >
            <span>{getBlockIcon(item.type)}</span>
            <span className="truncate max-w-24">{item.name}</span>
          </Button>
        </React.Fragment>
      ))}
    </div>
  );
};
