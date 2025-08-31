/**
 * Перечисления для типов блоков
 * Заменяют магические строки и обеспечивают типобезопасность
 */

/**
 * Типы блоков в системе визуального редактора
 */
export const BlockType = {
  // Layout блоки
  CONTAINER: 'container',
  CONTAINER_SECTION: 'container_section',
  COLUMNS: 'columns',
  SECTION: 'section',

  // Атомарные блоки
  HEADING: 'heading',
  TEXT: 'text',
  IMAGE: 'image',
  ICON: 'icon',
  SPACER: 'spacer',

  // Интерактивные блоки
  SINGLE_BUTTON: 'single_button',
  TABS: 'tabs',
  ACCORDION: 'accordion',

  // Композитные блоки
  CARD: 'card',
} as const;

/**
 * Тип для значений перечисления BlockType
 */
export type BlockTypeEnum = typeof BlockType[keyof typeof BlockType];

/**
 * Утилитарная функция для проверки типа блока
 */
export const isBlockType = (value: string): value is BlockTypeEnum => {
  return Object.values(BlockType).includes(value as BlockTypeEnum);
};

/**
 * Группы типов блоков для удобства работы
 */
export const BlockTypeGroups = {
  LAYOUT: [BlockType.CONTAINER, BlockType.CONTAINER_SECTION, BlockType.COLUMNS, BlockType.SECTION],
  ATOMIC: [BlockType.HEADING, BlockType.TEXT, BlockType.IMAGE, BlockType.ICON, BlockType.SPACER],
  INTERACTIVE: [BlockType.SINGLE_BUTTON, BlockType.TABS, BlockType.ACCORDION],
  COMPOSITE: [BlockType.CARD],
} as const;
