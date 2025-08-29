/**
 * Реестр блоков для серверной валидации иерархии
 * Содержит только необходимые данные для проверки allowedChildren и allowedSlots
 */

import { supabaseAdmin } from './supabaseClient';

export interface BlockSpec {
  /** Уникальный идентификатор, совпадает с block_type в БД */
  type: string;
  /** Массив типов блоков, которые можно вкладывать в этот блок */
  allowedChildren?: string[];
  /** Массив имен слотов для вложенных блоков */
  allowedSlots?: string[];
}

/**
 * Реестр всех доступных блоков с их правилами валидации
 */
export const BLOCK_REGISTRY: Record<string, BlockSpec> = {
  // Атомарные блоки (не могут содержать другие блоки)
  heading: {
    type: 'heading',
  },

  paragraph: {
    type: 'paragraph',
  },

  single_image: {
    type: 'single_image',
  },

  single_button: {
    type: 'single_button',
  },

  spacer: {
    type: 'spacer',
  },

  // Контейнерные блоки
  header: {
    type: 'header',
  },

  categories_section: {
    type: 'categories_section',
  },

  controls_section: {
    type: 'controls_section',
  },

  button_group: {
    type: 'button_group',
  },

  properties_section: {
    type: 'properties_section',
  },

  animations_section: {
    type: 'animations_section',
  },

  changelog_section: {
    type: 'changelog_section',
  },

  // Контейнер с колонками
  container_section: {
    type: 'container_section',
    allowedChildren: [
      'button_group',
      'categories_section',
      'controls_section',
      'properties_section',
      'animations_section',
      'changelog_section',
      'heading',
      'paragraph',
      'single_image',
      'single_button',
      'spacer',
      'tabs_block',
      'accordion_block'
    ],
    allowedSlots: ['column1', 'column2', 'column3'],
  },

  // Новые контейнерные блоки
  tabs_block: {
    type: 'tabs_block',
    allowedChildren: [
      'button_group',
      'categories_section',
      'controls_section',
      'properties_section',
      'animations_section',
      'changelog_section',
      'heading',
      'paragraph',
      'single_image',
      'single_button',
      'spacer',
      'container_section'
    ],
    // allowedSlots генерируется динамически на основе tabs в контенте
  },

  accordion_block: {
    type: 'accordion_block',
    allowedChildren: [
      'button_group',
      'categories_section',
      'controls_section',
      'properties_section',
      'animations_section',
      'changelog_section',
      'heading',
      'paragraph',
      'single_image',
      'single_button',
      'spacer',
      'container_section'
    ],
    // allowedSlots генерируется динамически на основе sections в контенте
  },
};

/**
 * Получить спецификацию блока по его типу
 */
export function getBlockSpec(blockType: string): BlockSpec | null {
  return BLOCK_REGISTRY[blockType] || null;
}

/**
 * Проверить, является ли блок контейнерным (может содержать другие блоки)
 */
export function isContainerBlock(blockType: string): boolean {
  // Явно указываем контейнерные блоки, включая новые
  const containerTypes = [
    'container_section',
    'tabs_block',
    'accordion_block'
  ];
  return containerTypes.includes(blockType);
}

/**
 * Асинхронная функция валидации размещения блока
 * Проверяет, можно ли разместить блок childType в родительском блоке parentBlockId со слотом slot
 *
 * @param childType - тип дочернего блока
 * @param parentBlockId - ID родительского блока (null для корневых блоков)
 * @param slot - имя слота (опционально)
 * @returns Promise<boolean> - true если размещение допустимо, false в противном случае
 */
export async function isValidPlacement(
  childType: string,
  parentBlockId: string | null,
  slot?: string | null
): Promise<boolean> {
  console.log('Validating placement:', { childType, parentBlockId, slot });

  // Корневые блоки всегда допустимы
  if (parentBlockId === null) {
    console.log('Root block placement - allowed');
    return true;
  }

  try {
    // Получаем тип родительского блока из базы данных
    const { data: parentBlock, error } = await supabaseAdmin
      .from('layout_blocks')
      .select('block_type')
      .eq('id', parentBlockId)
      .single();

    if (error || !parentBlock) {
      console.error('Failed to fetch parent block:', error);
      return false;
    }

    const parentSpec = getBlockSpec(parentBlock.block_type);
    if (!parentSpec) {
      console.error('Parent block type not found in registry:', parentBlock.block_type);
      return false;
    }

    // Проверяем, входит ли дочерний блок в список разрешенных
    if (parentSpec.allowedChildren && !parentSpec.allowedChildren.includes(childType)) {
      console.error(`Block type '${childType}' not allowed as child of '${parentBlock.block_type}'`);
      return false;
    }

    // Проверяем слот, если он указан
    if (slot) {
      let isSlotAllowed = false;

      // Для статических слотов
      if (parentSpec.allowedSlots && parentSpec.allowedSlots.includes(slot)) {
        isSlotAllowed = true;
      }
      // Для динамических слотов (tabs_block и accordion_block)
      else if (parentBlock.block_type === 'tabs_block' || parentBlock.block_type === 'accordion_block') {
        // Получаем контент блока для определения динамических слотов
        const { data: parentContent, error: contentError } = await supabaseAdmin
          .from('layout_blocks')
          .select('content')
          .eq('id', parentBlockId)
          .single();

        if (!contentError && parentContent?.content) {
          const content = parentContent.content as any;
          if (parentBlock.block_type === 'tabs_block' && content.tabs) {
            // Динамические слоты на основе вкладок
            isSlotAllowed = content.tabs.some((tab: any) => tab.id === slot);
          } else if (parentBlock.block_type === 'accordion_block' && content.sections) {
            // Динамические слоты на основе секций
            isSlotAllowed = content.sections.some((section: any) => section.id === slot);
          }
        }
      }

      if (!isSlotAllowed) {
        console.error(`Slot '${slot}' not allowed in block '${parentBlock.block_type}'`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error during placement validation:', error);
    return false;
  }
}
