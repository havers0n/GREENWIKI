import React, { useMemo, useState } from 'react';
import { blockRegistry } from 'shared/config/blockRegistry';
import type { BlockSpec } from 'shared/config/blockRegistry';
import { Card, Typography, Input, Accordion } from '@my-forum/ui';
import { ComponentCard } from 'shared/components';
import { useFavorites } from 'shared/hooks/useFavorites';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// Компонент для превью блоков
const BlockPreview: React.FC<{ spec: BlockSpec<any> }> = ({ spec }) => {
  const previewData = spec.previewData?.();

  // Простое превью для разных типов блоков
  const renderPreview = () => {
    switch (spec.type) {
      case 'heading':
        return (
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {previewData?.text || 'Заголовок'}
          </div>
        );

      case 'text':
        return (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {previewData?.text || 'Пример текста для превью'}
          </div>
        );

      case 'button':
        return (
          <div className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium">
            {previewData?.text || 'Кнопка'}
          </div>
        );

      case 'image':
        return (
          <div className="w-full h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center text-xs text-gray-500">
            🖼️ Изображение
          </div>
        );

      case 'columns':
        const columns = previewData?.layout === 'three' ? 3 : 2;
        return (
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded text-xs flex items-center justify-center text-gray-500">
                Колонка {i + 1}
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="text-xs text-gray-500 dark:text-gray-400 italic">
            {spec.name}
          </div>
        );
    }
  };

  return (
    <div className="mt-2 p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/50">
      {renderPreview()}
    </div>
  );
};

interface BlockLibraryProps {
	onAddBlock?: (type: string) => void | Promise<void>;
	creating?: boolean;
	disabledTypes?: string[];
}

const BlockLibrary: React.FC<BlockLibraryProps> = ({ onAddBlock, creating = false, disabledTypes }) => {
	const [search, setSearch] = useState('');
	const { favorites } = useFavorites();

	// console.log('BlockLibrary: Rendered with onAddBlock:', !!onAddBlock, 'creating:', creating);

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
		<Card className="p-4 space-y-4">
			<div className="flex items-center justify-between">
				<Typography as="h2" variant="h2">Библиотека компонентов</Typography>
			</div>

			<div>
				<Input
					label="Поиск"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Название, тег или описание"
				/>
			</div>

			{sortedCategories.length === 0 ? (
				<div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
					Ничего не найдено. Измените поисковый запрос.
				</div>
			) : (
				<Accordion
					items={accordionItems}
					defaultExpanded={groupedSpecs['Избранное'] ? ['Избранное', 'Базовые'] : ['Базовые']}
					allowMultiple={true}
				/>
			)}
		</Card>
	);
};

export default BlockLibrary;

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

	// console.log(`DraggableLibraryItem: Rendering for ${spec.type}, has onAddBlock: ${!!onAddBlock}`);
	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		opacity: isDragging ? 0.85 : 1,
	};

	const handleAdd = async () => {
		try {
			console.log('🚀 DRAGGABLE: handleAdd called for spec:', spec.type);
			if (onAddBlock) {
				console.log('🚀 DRAGGABLE: Calling onAddBlock with type:', spec.type);
				await onAddBlock(spec.type);
				console.log('✅ DRAGGABLE: Block added successfully');
			} else {
				console.warn('❌ DRAGGABLE: onAddBlock function not provided');
			}
		} catch (error) {
			console.error('❌ DRAGGABLE: Error adding block:', error);
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
			<ComponentCard
				spec={spec}
				onAdd={handleAdd}
				disabled={disabled}
				creating={creating}
			/>
		</div>
	);
};


