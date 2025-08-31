import React, { useState } from 'react';
import { ContextualInspector } from '../../ContextualInspector/indexNew';
import BlockLibrarySidebar from './BlockLibrarySidebar';
import ReusableBlocksLibrarySidebar from './ReusableBlocksLibrarySidebar';
import type { UnifiedSidebarProps, SidebarView } from '../types';

/**
 * UnifiedSidebar - единый командный центр правой панели редактора
 * Управляет состоянием активного вида и рендерит соответствующие компоненты
 */
const UnifiedSidebar: React.FC<UnifiedSidebarProps> = ({
  selectedBlockId,
  selectedBlock,
  onBlockChange,
  onPublishToggle,
  publishing,
  onBlockDelete,
  allBlocks,
  onMoveLeft,
  onMoveRight,
  onAddBlock,
  adding,
  pageIdentifier,
  externalActiveView,
  onViewChange,
}) => {
  // Состояние активного вида (внутреннее или внешнее)
  const [internalActiveView, setInternalActiveView] = useState<SidebarView>(
    selectedBlockId ? 'INSPECTOR' : 'PAGE_SETTINGS'
  );

  // Используем внешнее управление видом, если оно предоставлено
  const activeView = externalActiveView !== undefined ? externalActiveView : internalActiveView;

  // Обновляем активный вид при изменении selectedBlockId
  React.useEffect(() => {
    if (selectedBlockId) {
      if (activeView === 'PAGE_SETTINGS') {
        if (onViewChange) {
          onViewChange('INSPECTOR');
        } else {
          setInternalActiveView('INSPECTOR');
        }
      }
    } else {
      if (activeView === 'INSPECTOR') {
        if (onViewChange) {
          onViewChange('PAGE_SETTINGS');
        } else {
          setInternalActiveView('PAGE_SETTINGS');
        }
      }
    }
  }, [selectedBlockId, activeView, onViewChange]);

  // Обработчики переключения видов
  const handleViewChange = (view: SidebarView) => {
    if (onViewChange) {
      onViewChange(view);
    } else {
      setInternalActiveView(view);
    }
  };

  // Рендеринг навигации
  const renderNavigation = () => (
    <div className="flex items-center gap-1 p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      {/* Кнопка настроек (инспектор) */}
      <button
        onClick={() => handleViewChange('INSPECTOR')}
        className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
          activeView === 'INSPECTOR'
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        } ${!selectedBlockId ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={selectedBlockId ? "Настройки блока" : "Выберите блок для редактирования"}
        disabled={!selectedBlockId}
      >
        ⚙️
      </button>

      {/* Кнопка добавить блок */}
      <button
        onClick={() => handleViewChange('BLOCK_LIBRARY')}
        className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
          activeView === 'BLOCK_LIBRARY'
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title="Библиотека блоков"
      >
        ➕
      </button>

      {/* Кнопка компонентов */}
      <button
        onClick={() => handleViewChange('REUSABLE_LIBRARY')}
        className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
          activeView === 'REUSABLE_LIBRARY'
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title="Переиспользуемые блоки"
      >
        🧩
      </button>
    </div>
  );

  // Рендеринг содержимого на основе активного вида
  const renderContent = () => {
    switch (activeView) {
      case 'INSPECTOR':
        if (!selectedBlockId) {
          return (
            <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
              <div>
                <div className="text-3xl mb-2">👆</div>
                <p className="text-sm">Выберите блок для редактирования</p>
                <p className="text-xs mt-1 opacity-75">Кликните на любой блок слева</p>
              </div>
            </div>
          );
        }
        return (
          <div data-tutorial="inspector">
            <ContextualInspector
              block={selectedBlock}
              isOpen={true}
              onClose={() => {}} // Не используется в новой архитектуре
              onBlockChange={onBlockChange}
              onPublishToggle={async (blockId) => onPublishToggle(blockId)}
              publishing={publishing}
              onBlockDelete={(blockId) => onBlockDelete(blockId)}
              allBlocks={allBlocks}
              onMoveLeft={(blockId) => onMoveLeft(blockId)}
              onMoveRight={(blockId) => onMoveRight(blockId)}
              blockId={selectedBlockId}
            />
          </div>
        );

      case 'BLOCK_LIBRARY':
        return (
          <BlockLibrarySidebar
            onAddBlock={onAddBlock}
            creating={adding}
          />
        );

      case 'REUSABLE_LIBRARY':
        return (
          <ReusableBlocksLibrarySidebar />
        );

      case 'PAGE_SETTINGS':
      default:
        return (
          <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <div>
              <div className="text-3xl mb-2">⚙️</div>
              <p className="text-sm">Настройки страницы</p>
              <p className="text-xs mt-1 opacity-75">Скоро будет доступно</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className="w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col h-full"
      data-tutorial="sidebar"
    >
      {/* Навигация */}
      {renderNavigation()}

      {/* Содержимое */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default UnifiedSidebar;
