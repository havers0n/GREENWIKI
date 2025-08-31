import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Tabs, TabList, Tab, TabPanel } from '@my-forum/ui';
import { Breadcrumbs } from '../../Breadcrumbs';
import { OverridesPanel } from '../../OverridesPanel';
import { InspectorHeader } from './InspectorHeader';
import { BlockInfo } from './BlockInfo';
import { BlockNavigation } from './BlockNavigation';
import { BlockContentEditor } from './BlockContentEditor';
import { BlockDesignEditor } from './BlockDesignEditor';
import { BlockActions } from './BlockActions';
import { useInspectorLogic, useBlockMetadata } from '../model/useInspectorLogic';
import type { ContextualInspectorProps } from '../types';

/**
 * Новый рефакторированный ContextualInspector
 * Разделен на мелкие компоненты с четкими ответственностями
 */
const ContextualInspectorNew: React.FC<ContextualInspectorProps> = ({
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
  blockId,
}) => {
  // Используем хуки для логики
  const {
    spec,
    isInstance,
    Editor,
    data,
    metadata,
    statusInfo
  } = useInspectorLogic(block, blockId);

  const { handleMetadataChange } = useBlockMetadata(block, onBlockChange);

  // Проверяем наличие блока и спецификации
  if (!block) return null;
  if (!spec) return null;

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
            <InspectorHeader block={block} onClose={onClose} />

            {/* Хлебные крошки */}
            <Breadcrumbs
              selectedBlock={block}
              allBlocks={allBlocks}
              onSelectBlock={(selectedBlockId) => {
                // Здесь нужно будет реализовать логику навигации
                if (selectedBlockId && selectedBlockId !== block.id) {
                  console.log('Navigate to block:', selectedBlockId);
                }
              }}
              visible={true}
            />

            {/* Метаинформация о блоке */}
            <BlockInfo block={block} statusInfo={statusInfo} />

            {/* Управление позицией блока */}
            <BlockNavigation
              block={block}
              allBlocks={allBlocks}
              onMoveLeft={onMoveLeft}
              onMoveRight={onMoveRight}
            />

            {/* Описание блока */}
            {spec.description && (
              <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                {spec.description}
              </div>
            )}

            {/* Вкладки с настройками */}
            <Tabs defaultValue={isInstance ? 0 : 1} className="w-full">
              <TabList className="mb-4">
                {isInstance && (
                  <Tab index={0} className="text-sm">
                    🔄 Переопределения
                  </Tab>
                )}
                <Tab index={isInstance ? 1 : 0} className="text-sm">
                  📝 Настройки блока
                </Tab>
                <Tab index={isInstance ? 2 : 1} className="text-sm">
                  🎨 Дизайн
                </Tab>
              </TabList>

              {/* Вкладка переопределений */}
              {isInstance && blockId && (
                <TabPanel index={0} className="space-y-4">
                  <OverridesPanel
                    blockId={blockId}
                    onSave={() => {
                      console.log('Overrides saved successfully');
                    }}
                    onError={(error) => {
                      console.error('Overrides save error:', error);
                    }}
                  />
                </TabPanel>
              )}

              {/* Вкладка контента */}
              <TabPanel index={isInstance ? 1 : 0} className="space-y-4">
                <BlockContentEditor
                  block={block}
                  spec={spec}
                  data={data}
                  onBlockChange={onBlockChange}
                />
              </TabPanel>

              {/* Вкладка дизайна */}
              <TabPanel index={isInstance ? 2 : 1} className="space-y-4">
                <BlockDesignEditor
                  block={block}
                  metadata={metadata}
                  onMetadataChange={handleMetadataChange}
                />
              </TabPanel>
            </Tabs>

            {/* Панели действий */}
            <BlockActions
              block={block}
              onBlockDelete={onBlockDelete}
              onPublishToggle={onPublishToggle}
              publishing={publishing}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

ContextualInspectorNew.displayName = 'ContextualInspectorNew';

export { ContextualInspectorNew };
export default ContextualInspectorNew;
