import type { BlockNode, LayoutBlock, BlockContent } from '../../types/api';
import type { Database } from '@my-forum/db-types';

/**
 * Маппер для преобразования данных из БД в UI типы
 * Единый Источник Правды для всех преобразований
 */

type LayoutBlockRow = Database['public']['Tables']['layout_blocks']['Row'];

/**
 * Преобразует плоский объект из БД в BlockNode для UI
 * Добавляет пустой массив children для дальнейшего построения дерева
 */
export function dbRowToUi(dbRow: LayoutBlockRow): BlockNode {
  const { ...blockNode } = dbRow;

  return {
    // Поля из db-types layout_blocks
    ...blockNode,
    // TODO: Add proper type validation for block content
    content: dbRow.content as unknown as BlockContent,

    // Дополнительные поля для фронтенда
    children: [], // Пустой массив, будет заполнен buildTreeFromFlat
    overrides: {} // Пустой объект по умолчанию
  };
}

/**
 * Преобразует массив плоских объектов из БД в массив BlockNode для UI
 */
export function dbRowsToUi(dbRows: LayoutBlockRow[]): BlockNode[] {
  return dbRows.map(dbRowToUi);
}

/**
 * Преобразует BlockNode обратно в плоский формат для отправки в БД
 * Удаляет поле children перед отправкой
 */
export function uiToDbRow(blockNode: BlockNode): LayoutBlock {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children, ...layoutBlock } = blockNode;
  return layoutBlock;
}

/**
 * Преобразует массив BlockNode обратно в плоский формат для отправки в БД
 */
export function uiToDbRows(blockNodes: BlockNode[]): LayoutBlock[] {
  return blockNodes.map(uiToDbRow);
}
