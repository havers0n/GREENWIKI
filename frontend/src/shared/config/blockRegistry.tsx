import React from 'react';
import { Input, Textarea } from 'shared/ui/atoms';

export interface BlockSpec<T = unknown> {
	/** Уникальный идентификатор, совпадает с block_type в БД */
	type: string;
	/** Человекопонятное название для UI */
	name: string;
	/** Дефолтные данные контента */
	defaultData: () => T;
	/** Компонент-редактор для формы редактирования */
	Editor: React.FC<{ data: T; onChange: (data: T) => void }>;
}

// Редактор для блоков без настраиваемых параметров
const NoConfigEditor: React.FC<{ data: Record<string, unknown>; onChange: (d: Record<string, unknown>) => void }> = () => {
	return (
		<div className="text-sm text-gray-500 dark:text-gray-400">
			Для этого блока нет настраиваемых параметров.
		</div>
	);
};

// CategoriesSection
interface CategoriesSectionData { title: string; description: string }
const CategoriesSectionEditor: React.FC<{ data: CategoriesSectionData; onChange: (d: CategoriesSectionData) => void }> = ({ data, onChange }) => {
	return (
		<div className="space-y-3">
			<Input
				label="Заголовок"
				value={data.title}
				onChange={(e) => onChange({ ...data, title: e.target.value })}
				placeholder="Например: Общие категории"
			/>
			<Textarea
				label="Описание"
				rows={4}
				value={data.description}
				onChange={(e) => onChange({ ...data, description: e.target.value })}
				placeholder="Краткое описание раздела"
			/>
		</div>
	);
};

// ControlsSection
interface ControlsSectionData { title: string }
const ControlsSectionEditor: React.FC<{ data: ControlsSectionData; onChange: (d: ControlsSectionData) => void }> = ({ data, onChange }) => {
	return (
		<div className="space-y-3">
			<Input
				label="Заголовок"
				value={data.title}
				onChange={(e) => onChange({ ...data, title: e.target.value })}
				placeholder="Например: UI Компоненты"
			/>
		</div>
	);
};

export const blockRegistry: Record<string, BlockSpec<any>> = {
	header: {
		type: 'header',
		name: 'Шапка',
		defaultData: () => ({}),
		Editor: NoConfigEditor,
	},
	categories_section: {
		type: 'categories_section',
		name: 'Сетка разделов форума',
		defaultData: () => ({ title: 'Новый раздел', description: '' }),
		Editor: CategoriesSectionEditor,
	},
	controls_section: {
		type: 'controls_section',
		name: 'Демо UI контролов',
		defaultData: () => ({ title: 'UI Компоненты' }),
		Editor: ControlsSectionEditor,
	},
	properties_section: {
		type: 'properties_section',
		name: 'Недвижимость',
		defaultData: () => ({ title: 'Недвижимость', subtitle: 'Таблица недвижимости' }),
		Editor: NoConfigEditor,
	},
	animations_section: {
		type: 'animations_section',
		name: 'Анимации',
		defaultData: () => ({ title: 'Анимации', subtitle: 'Таблица анимаций' }),
		Editor: NoConfigEditor,
	},
	changelog_section: {
		type: 'changelog_section',
		name: 'История изменений',
		defaultData: () => ({ title: 'История изменений' }),
		Editor: NoConfigEditor,
	},
};
