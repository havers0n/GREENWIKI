import React, { useMemo, useState } from 'react';
import { blockRegistry } from 'shared/config/blockRegistry';
import type { BlockSpec } from 'shared/config/blockRegistry';
import { Input, Accordion } from '@my-forum/ui';
import { ComponentCard } from 'shared/components';
import { useFavorites } from 'shared/hooks/useFavorites';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface BlockLibrarySidebarProps {
  onAddBlock?: (type: string) => void | Promise<void>;
  creating?: boolean;
  disabledTypes?: string[];
}

/**
 * BlockLibrarySidebar - адаптированная версия BlockLibrary для работы в UnifiedSidebar
 * Убрана Card обертка и заголовок, добавлена поддержка скролла
 */
const BlockLibrarySidebar: React.FC<BlockLibrarySidebarProps> = ({
  onAddBlock,
  creating = false,
  disabledTypes
}) => {
  const [search, setSearch] = useState('');
  const { favorites } = useFavorites();

  const specs = useMemo(() => Object.values(blockRegistry), []);

  // Группировка компонентов по категориям
  const groupedSpecs = useMemo(() => {
    const groups: Record<string, BlockSpec<any>[]> = {};
    const q = search.trim().toLowerCase();

    // Сначала добавляем избранные компоненты
    if (favorites.length > 0 && q.length === 0) {
      groups['Избранное'] = [];
      for (const spec of specs) {
        if (favorites.includes(spec.type)) {
          groups['Избранное'].push(spec);
        }
      }
    }

    // Затем группируем остальные компоненты
    for (const spec of specs) {
      const haystack = [
        spec.name,
        spec.type,
        spec.description ?? '',
        ...(spec.tags ?? []),
      ].join(' ').toLowerCase();
      const matchQuery = q.length === 0 ? true : haystack.includes(q);

      if (matchQuery) {
        const category = spec.category || 'Разное';
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(spec);
      }
    }

    return groups;
  }, [specs, search, favorites]);

  // Определение порядка категорий
  const categoryOrder = ['Избранное', 'Структура', 'Контент', 'Композиты'];
  const sortedCategories = useMemo(() => {
    const categories = Object.keys(groupedSpecs);
    return categories.sort((a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [groupedSpecs]);

  // Создание элементов аккордеона
  const accordionItems = useMemo(() => {
    return sortedCategories.map(category => ({
      id: category,
      title: category,
      content: (
        <div className="grid grid-cols-1 gap-3">
          {groupedSpecs[category].map((spec) => (
            <DraggableLibraryItem
              key={spec.type}
              spec={spec}
              disabled={creating || (disabledTypes?.includes(spec.type) ?? false)}
              onAddBlock={onAddBlock}
              creating={creating}
            />
          ))}
        </div>
      )
    }));
  }, [sortedCategories, groupedSpecs, creating, disabledTypes, onAddBlock]);

  return (
    <div className="h-full flex flex-col">
      {/* Поиск */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Input
          label="Поиск блоков"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Название, тег или описание"
        />
      </div>

      {/* Список блоков */}
      <div className="flex-1 overflow-y-auto p-4">
        {sortedCategories.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            Ничего не найдено. Измените поисковый запрос.
          </div>
        ) : (
          <Accordion
            items={accordionItems}
            defaultExpanded={groupedSpecs['Избранное'] ? ['Избранное', 'Структура'] : ['Структура']}
            allowMultiple={true}
          />
        )}
      </div>
    </div>
  );
};

const DraggableLibraryItem: React.FC<{
  spec: BlockSpec<any>;
  disabled: boolean;
  creating: boolean;
  onAddBlock?: (type: string) => void | Promise<void>;
}> = ({ spec, disabled, creating, onAddBlock }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `block-type:${spec.type}`,
    disabled: disabled
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.85 : 1,
  };

  const handleAdd = async () => {
    try {
      console.log('🚀 SIDEBAR DRAGGABLE: handleAdd called for spec:', spec.type);
      if (onAddBlock) {
        console.log('🚀 SIDEBAR DRAGGABLE: Calling onAddBlock with type:', spec.type);
        await onAddBlock(spec.type);
        console.log('✅ SIDEBAR DRAGGABLE: Block added successfully');
      } else {
        console.warn('❌ SIDEBAR DRAGGABLE: onAddBlock function not provided');
      }
    } catch (error) {
      console.error('❌ SIDEBAR DRAGGABLE: Error adding block:', error);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="transition-all duration-200"
    >
      <div data-tutorial={spec.type === 'heading' ? 'block-item' : undefined}>
        <ComponentCard
          spec={spec}
          onAdd={handleAdd}
          disabled={disabled}
          creating={creating}
        />
      </div>
    </div>
  );
};

export default BlockLibrarySidebar;
