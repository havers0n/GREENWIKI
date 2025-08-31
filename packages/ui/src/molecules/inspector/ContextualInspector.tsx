import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Tabs, TabList, Tab, TabPanel } from '../Tabs';
import { InspectorSection } from '../InspectorSection';
import { InspectorField } from '../InspectorField';
import { ControlRenderer } from './ControlRenderer';
import { getBlockInspectorConfig } from './inspectorRegistry';
import type { BlockInspectorConfig, InspectorSectionConfig, BlockData } from './types';

export interface ContextualInspectorProps {
  block: {
    id: string;
    block_type: string;
    content?: any;
    metadata?: Record<string, any>;
    status?: string;
    position?: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onBlockChange: (updatedBlock: any) => void;
  className?: string;
}

/**
 * Новый ContextualInspector с декларативной конфигурационной системой
 * Полностью избавлен от жестких зависимостей от типов блоков
 */
export const ContextualInspector: React.FC<ContextualInspectorProps> = ({
  block,
  isOpen,
  onClose,
  onBlockChange,
  className,
}) => {
  // Проверяем наличие блока
  if (!block) return null;

  // Получаем конфигурацию для типа блока
  const config = getBlockInspectorConfig(block.block_type);

  // Если конфигурации нет, показываем сообщение
  if (!config) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-y-auto ${className || ''}`}
          >
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Инспектор
                </h2>
                <button
                  onClick={onClose}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Закрыть инспектор"
                >
                  ✕
                </button>
              </div>

              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-4">🔧</div>
                <p className="text-sm">
                  Конфигурация для блока типа <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">{block.block_type}</code> не найдена
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Подготавливаем данные блока
  const blockData: BlockData = {
    content: block.content || {},
    metadata: block.metadata || {},
  };

  // Обработчик изменения данных блока
  const handleBlockDataChange = (sectionKey: 'content' | 'metadata', propName: string, value: any) => {
    const updatedBlock = {
      ...block,
      [sectionKey]: {
        ...(block[sectionKey] || {}),
        [propName]: value,
      },
    };
    onBlockChange(updatedBlock);
  };

  // Рендерим секции инспектора
  const renderSection = (section: InspectorSectionConfig, sectionIndex: number) => (
    <InspectorSection
      key={sectionIndex}
      title={section.title}
      icon={section.icon}
      collapsible={section.collapsible}
      defaultExpanded={section.defaultExpanded}
    >
      <div className="space-y-4">
        {section.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {section.description}
          </p>
        )}

        {section.controls.map((control, controlIndex) => {
          // Определяем, где хранятся данные для этого контрола
          const isContentField = ['text', 'href', 'level', 'id', 'description'].includes(control.propName);
          const dataSource = isContentField ? 'content' : 'metadata';
          const currentValue = blockData[dataSource]?.[control.propName];

          return (
            <InspectorField
              key={controlIndex}
              label={control.label}
              hint={control.hint}
              required={control.required}
            >
              <ControlRenderer
                control={control}
                value={currentValue}
                onChange={(value) => handleBlockDataChange(dataSource, control.propName, value)}
                disabled={false}
              />
            </InspectorField>
          );
        })}
      </div>
    </InspectorSection>
  );

  // Группируем секции по типам для вкладок
  const contentSections = config.filter(section =>
    section.controls.some(control => ['text', 'href', 'level', 'id', 'description'].includes(control.propName))
  );

  const designSections = config.filter(section =>
    section.controls.some(control => !['text', 'href', 'level', 'id', 'description'].includes(control.propName))
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-y-auto ${className || ''}`}
        >
          <div className="p-6 space-y-6">
            {/* Заголовок */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {getBlockTypeIcon(block.block_type)}
                </span>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {getBlockTypeName(block.block_type)}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Закрыть инспектор"
              >
                ✕
              </button>
            </div>

            {/* Информация о блоке */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Позиция:</span>
                <span>#{block.position || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Статус:</span>
                <span className={getStatusColor(block.status || 'draft')}>
                  {getStatusIcon(block.status || 'draft')} {getStatusText(block.status || 'draft')}
                </span>
              </div>
            </div>

            {/* Вкладки с настройками */}
            <Tabs defaultValue={0} className="w-full">
              <TabList className="mb-4">
                <Tab index={0} className="text-sm">
                  📝 Содержимое
                </Tab>
                <Tab index={1} className="text-sm">
                  🎨 Дизайн
                </Tab>
              </TabList>

              <TabPanel index={0} className="space-y-4">
                {contentSections.length > 0 ? (
                  contentSections.map(renderSection)
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="text-2xl mb-2">📝</div>
                    <p className="text-sm">Настройки содержимого недоступны для этого блока</p>
                  </div>
                )}
              </TabPanel>

              <TabPanel index={1} className="space-y-4">
                {designSections.length > 0 ? (
                  designSections.map((section, index) => renderSection(section, index))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="text-2xl mb-2">🎨</div>
                    <p className="text-sm">Дизайн настройки недоступны для этого блока</p>
                  </div>
                )}
              </TabPanel>
            </Tabs>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Вспомогательные функции
function getBlockTypeIcon(blockType: string): string {
  const icons: Record<string, string> = {
    heading: '📰',
    single_button: '🔘',
    container_section: '📦',
    paragraph: '📄',
    single_image: '🖼️',
    spacer: '📏',
  };
  return icons[blockType] || '📄';
}

function getBlockTypeName(blockType: string): string {
  const names: Record<string, string> = {
    heading: 'Заголовок',
    single_button: 'Кнопка',
    container_section: 'Контейнер',
    paragraph: 'Параграф',
    single_image: 'Изображение',
    spacer: 'Разделитель',
  };
  return names[blockType] || 'Блок';
}

function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    published: '✓',
    draft: '○',
  };
  return icons[status] || '○';
}

function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    published: 'Опубликован',
    draft: 'Черновик',
  };
  return texts[status] || status;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    published: 'text-green-600 dark:text-green-400',
    draft: 'text-yellow-600 dark:text-yellow-400',
  };
  return colors[status] || 'text-gray-500 dark:text-gray-400';
}
