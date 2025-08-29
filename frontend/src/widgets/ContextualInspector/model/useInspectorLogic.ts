import { useMemo } from 'react';
import { useAppSelector } from '../../../store/hooks';
import { selectIsBlockInstance } from '../../../store/selectors/blockSelectors';
import { blockRegistry } from '../../../shared/config/blockRegistry';
import type {
  LayoutBlock,
  UseInspectorLogicResult,
  StatusInfo
} from '../types';

/**
 * Основной хук для логики ContextualInspector
 * Содержит всю бизнес-логику инспектора
 */
export const useInspectorLogic = (
  block: LayoutBlock | null,
  blockId?: string
): UseInspectorLogicResult => {
  // Получаем спецификацию блока из реестра
  const spec = useMemo(() => {
    if (!block?.block_type) return null;
    return blockRegistry[block.block_type];
  }, [block?.block_type]);

  // Проверяем, является ли блок экземпляром переиспользуемого блока
  const isInstance = blockId ? useAppSelector(state => selectIsBlockInstance(state, blockId)) : false;

  // Получаем компонент редактора
  const Editor = useMemo(() => {
    if (!spec?.Editor) return null;
    return spec.Editor as React.FC<{ data: unknown; onChange: (d: unknown) => void }>;
  }, [spec]);

  // Получаем данные блока
  const data = useMemo(() => {
    if (!block || !spec) return null;
    return (block.content ?? spec.defaultData()) as unknown;
  }, [block, spec]);

  // Получаем метаданные блока
  const metadata = useMemo(() => {
    if (!block) return {};
    return (block.metadata ?? {}) as Record<string, unknown>;
  }, [block]);

  // Получаем информацию о статусе
  const statusInfo = useMemo((): StatusInfo => {
    if (!block?.status) return { text: 'Неизвестен', color: 'text-gray-500 dark:text-gray-400', icon: '○' };

    switch (block.status) {
      case 'published':
        return { text: 'Опубликован', color: 'text-green-600 dark:text-green-400', icon: '✓' };
      case 'draft':
        return { text: 'Черновик', color: 'text-yellow-600 dark:text-yellow-400', icon: '○' };
      default:
        return { text: block.status, color: 'text-gray-500 dark:text-gray-400', icon: '○' };
    }
  }, [block?.status]);

  // Заглушки для функций перемещения (пока)
  const canMoveLeft = false;
  const canMoveRight = false;

  return {
    spec,
    isInstance,
    Editor,
    data,
    metadata,
    statusInfo,
    canMoveLeft,
    canMoveRight
  };
};

/**
 * Хук для получения иконки блока по типу
 */
export const useBlockIcon = (blockType: string): string => {
  return useMemo(() => {
    switch (blockType) {
      case 'header': return '🏠';
      case 'container_section': return '📦';
      case 'button_group': return '🔘';
      case 'categories_section': return '📁';
      case 'controls_section': return '⚙️';
      case 'properties_section': return '🏢';
      case 'animations_section': return '🎬';
      case 'changelog_section': return '📝';
      case 'heading': return '📰';
      case 'paragraph': return '📄';
      case 'single_image': return '🖼️';
      case 'single_button': return '🔘';
      case 'spacer': return '📏';
      default: return '📄';
    }
  }, [blockType]);
};

/**
 * Хук для работы с метаданными блока
 */
export const useBlockMetadata = (
  block: LayoutBlock | null,
  onBlockChange: (updatedBlock: LayoutBlock) => void
) => {
  const handleMetadataChange = (newMetadata: Record<string, unknown>) => {
    if (!block) return;

    const updated: LayoutBlock = {
      ...block,
      metadata: newMetadata
    } as LayoutBlock;

    onBlockChange(updated);
  };

  const metadata = (block?.metadata ?? {}) as Record<string, unknown>;

  return {
    metadata,
    handleMetadataChange
  };
};
