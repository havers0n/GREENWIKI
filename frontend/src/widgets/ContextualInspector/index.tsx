import React, { useState } from 'react';
import type { Database } from '@my-forum/db-types';
import { Typography, Button, Spinner } from 'shared/ui/atoms';
import { blockRegistry } from 'shared/config/blockRegistry';
import { AnimatePresence, motion } from 'framer-motion';
import { Tabs } from '@mantine/core';
import { SpacingControl, ColorPicker, BorderControl, BackgroundControl } from './controls';
import { Breadcrumbs } from 'widgets/Breadcrumbs';

type LayoutBlock = Database['public']['Tables']['layout_blocks']['Row'];

interface ContextualInspectorProps {
  block: LayoutBlock | null;
  isOpen: boolean;
  onClose: () => void;
  onBlockChange: (updatedBlock: LayoutBlock) => void;
  onPublishToggle?: (blockId: string) => Promise<void>;
  publishing?: boolean;
  onBlockDelete?: (blockId: string) => Promise<void>;
  // Для хлебных крошек
  allBlocks?: LayoutBlock[];
  // Для перемещения блоков
  onMoveLeft?: (blockId: string) => void;
  onMoveRight?: (blockId: string) => void;
}

const ContextualInspector: React.FC<ContextualInspectorProps> = ({
  block,
  isOpen,
  onClose,
  onBlockChange,
  onPublishToggle,
  publishing = false,
  onBlockDelete,
  allBlocks = [],
  onMoveLeft,
  onMoveRight,
}) => {
  // console.log('ContextualInspector: Rendered with block:', block?.id, 'isOpen:', isOpen);

  if (!block) return null;

  const spec = blockRegistry[block.block_type];
  if (!spec) return null;

  const Editor = spec.Editor as React.FC<{ data: unknown; onChange: (d: unknown) => void }>;
  const data = (block.content ?? spec.defaultData()) as unknown;
  const metadata = (block.metadata ?? {}) as Record<string, unknown>;

  // Получаем иконку блока
  const getBlockIcon = (blockType: string) => {
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
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'published':
        return { text: 'Опубликован', color: 'text-green-600 dark:text-green-400', icon: '✓' };
      case 'draft':
        return { text: 'Черновик', color: 'text-yellow-600 dark:text-yellow-400', icon: '○' };
      default:
        return { text: status, color: 'text-gray-500 dark:text-gray-400', icon: '○' };
    }
  };

  const statusInfo = getStatusInfo(block.status);

  // Функции для проверки возможности перемещения
  const canMoveLeft = (block: LayoutBlock): boolean => {
    if (!allBlocks) return false;

    const pageBlocks = allBlocks
      .filter(b => b.page_identifier === block.page_identifier)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    const currentIndex = pageBlocks.findIndex(b => b.id === block.id);
    return currentIndex > 0;
  };

  const canMoveRight = (block: LayoutBlock): boolean => {
    if (!allBlocks) return false;

    const pageBlocks = allBlocks
      .filter(b => b.page_identifier === block.page_identifier)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    const currentIndex = pageBlocks.findIndex(b => b.id === block.id);
    return currentIndex >= 0 && currentIndex < pageBlocks.length - 1;
  };

  // Функция для обновления metadata
  const handleMetadataChange = (newMetadata: Record<string, unknown>) => {
    const updated: LayoutBlock = { ...block, metadata: newMetadata } as LayoutBlock;
    onBlockChange(updated);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-y-auto"
        >
          <div className="p-6 space-y-6">
            {/* Заголовок инспектора */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getBlockIcon(block.block_type)}</span>
                <Typography as="h2" variant="h2" className="text-lg">
                  {spec.name}
                </Typography>
              </div>
              <Button onClick={onClose} size="sm" variant="ghost">
                ✕
              </Button>
            </div>

            {/* Хлебные крошки */}
            <Breadcrumbs
              selectedBlock={block}
              allBlocks={allBlocks}
              onSelectBlock={(blockId) => {
                // Здесь нужно будет реализовать логику навигации
                // Пока просто закрываем инспектор для демонстрации
                if (blockId && blockId !== block.id) {
                  // В будущем здесь будет логика выбора другого блока
                  console.log('Navigate to block:', blockId);
                }
              }}
              visible={true}
            />

            {/* Метаинформация о блоке */}
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

            {/* Управление позицией блока */}
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

            {/* Описание блока */}
            {spec.description && (
              <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                {spec.description}
              </div>
            )}

            {/* Вкладки с настройками */}
            <Tabs defaultValue="content" className="w-full">
              <Tabs.List className="mb-4">
                <Tabs.Tab value="content" className="text-sm">
                  📝 Настройки блока
                </Tabs.Tab>
                <Tabs.Tab value="design" className="text-sm">
                  🎨 Дизайн
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="content" className="space-y-4">
                <Editor
                  data={data}
                  onChange={(newData) => {
                    try {
                      if (spec.schema) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const result = (spec.schema as any).safeParse(newData);
                        if (!result.success) {
                          console.warn('Validation error:', result.error?.errors?.[0]?.message);
                          return;
                        }
                      }
                      const updated: LayoutBlock = { ...block, content: newData as object } as LayoutBlock;
                      onBlockChange(updated);
                    } catch (error) {
                      console.warn('Error updating block:', error);
                    }
                  }}
                />
              </Tabs.Panel>

              <Tabs.Panel value="design" className="space-y-4">
                {/* Дизайн контролы в зависимости от типа блока */}
                {(block.block_type === 'container_section' || block.block_type === 'single_button' || block.block_type === 'heading' || block.block_type === 'tabs' || block.block_type === 'accordion') && (
                  <>
                    {/* Spacing Control */}
                    <SpacingControl
                      value={metadata.spacing as any}
                      onChange={(spacing) => handleMetadataChange({ ...metadata, spacing })}
                    />

                    {/* Border Control для контейнера и кнопки */}
                    {(block.block_type === 'container_section' || block.block_type === 'single_button') && (
                      <BorderControl
                        value={metadata.border as any}
                        onChange={(border) => handleMetadataChange({ ...metadata, border })}
                      />
                    )}

                    {/* Background Control для контейнера */}
                    {block.block_type === 'container_section' && (
                      <BackgroundControl
                        value={metadata.background as any}
                        onChange={(background) => handleMetadataChange({ ...metadata, background })}
                      />
                    )}

                    {/* Color Picker для текста */}
                    {(block.block_type === 'single_button' || block.block_type === 'heading') && (
                      <ColorPicker
                        label="Цвет текста"
                        value={metadata.textColor as string}
                        onChange={(textColor) => handleMetadataChange({ ...metadata, textColor })}
                      />
                    )}
                  </>
                )}

                {/* Если блок не поддерживает дизайн настройки */}
                {!(block.block_type === 'container_section' || block.block_type === 'single_button' || block.block_type === 'heading' || block.block_type === 'tabs' || block.block_type === 'accordion') && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="text-2xl mb-2">🎨</div>
                    <p className="text-sm">Дизайн настройки недоступны для этого типа блока</p>
                  </div>
                )}
              </Tabs.Panel>
            </Tabs>

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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContextualInspector;
