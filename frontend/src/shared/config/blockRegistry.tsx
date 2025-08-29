import React from 'react';
import { z } from 'zod';
import { Input, Textarea, Select, Button } from 'shared/ui/atoms';

// Импорт редакторов блоков
import { HeadingEditor, ParagraphEditor, ImageEditor, ButtonEditor, SpacerEditor, TabsEditor, AccordionEditor } from 'features/BlockEditors';

// Ленивые импорты рендереров блоков
// Header экспортируется именованно, маппируем на default для React.lazy
const Header = React.lazy(() => import('widgets/Header').then((m) => ({ default: m.Header })));
const CategoriesSection = React.lazy(() => import('widgets/CategoriesSection'));
const ControlsSection = React.lazy(() => import('widgets/ControlsSection'));
const PropertiesSection = React.lazy(() => import('widgets/PropertiesSection'));
const AnimationsSection = React.lazy(() => import('widgets/AnimationsSection'));
const ChangelogSection = React.lazy(() => import('widgets/ChangelogSection'));
const ButtonGroup = React.lazy(() => import('widgets/ButtonGroup'));
const ContainerSection = React.lazy(() => import('widgets/ContainerSection'));
const TabsBlock = React.lazy(() => import('widgets/TabsBlock'));
const AccordionBlock = React.lazy(() => import('widgets/AccordionBlock'));

// Ленивые импорты атомарных блоков
const LazyHeadingBlock = React.lazy(() => import('widgets/AtomicBlocks/HeadingBlock'));
const LazyParagraphBlock = React.lazy(() => import('widgets/AtomicBlocks/ParagraphBlock'));
const LazyImageBlock = React.lazy(() => import('widgets/AtomicBlocks/ImageBlock'));
const LazyButtonBlock = React.lazy(() => import('widgets/AtomicBlocks/ButtonBlock'));
const LazySpacerBlock = React.lazy(() => import('widgets/AtomicBlocks/SpacerBlock'));

export interface BlockSpec<T = unknown> {
	/** Уникальный идентификатор, совпадает с block_type в БД */
	type: string;
	/** Человекопонятное название для UI */
	name: string;
	/** Дефолтные данные контента */
	defaultData: () => T;
	/** Компонент-редактор для формы редактирования */
	Editor: React.FC<{ data: T; onChange: (data: T) => void }>;
	/** Компонент для отображения блока на странице */
	Renderer: React.LazyExoticComponent<React.ComponentType<any>>;
	/** Категория для библиотеки компонентов (используется для группировки) */
	category: string;
	/** Название иконки для отображения в библиотеке */
	icon: string;
	/** Теги для поиска в библиотеке компонентов */
	tags?: string[];
	/** Описание для карточки в библиотеке компонентов */
	description?: string;
	/** Предпросмотрные данные, упрощающие генерацию превью */
	previewData?: () => Partial<T>;
	/** Версия схемы данных контента (для будущих миграций) */
	schemaVersion?: number;
	/** Zod-схема для валидации данных контента */
	schema?: z.ZodType<T>;
	/** Массив типов блоков, которые можно вкладывать в этот блок */
	allowedChildren?: string[];
	/** Массив имен слотов для вложенных блоков */
	allowedSlots?: string[];
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
const CategoriesSectionSchema = z.object({
	title: z.string().min(1, 'Заголовок обязателен'),
	description: z.string().default(''),
});
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
const ControlsSectionSchema = z.object({
	title: z.string().min(1, 'Заголовок обязателен'),
});
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

// Button Group (композитный контент)
interface ButtonGroupItem {
	id: string;
	text: string;
	link: string;
	variant: 'primary' | 'secondary' | 'danger' | 'ghost';
}

interface ButtonGroupData {
	items: ButtonGroupItem[];
}

const ButtonGroupItemSchema = z.object({
	id: z.string().min(1),
	text: z.string().min(1, 'Текст обязателен'),
	link: z.string().default(''),
	variant: z.enum(['primary', 'secondary', 'danger', 'ghost']),
});

const ButtonGroupSchema = z.object({
	items: z.array(ButtonGroupItemSchema).min(1, 'Должна быть хотя бы одна кнопка'),
});

const ButtonGroupEditor: React.FC<{ data: ButtonGroupData; onChange: (d: ButtonGroupData) => void }> = ({ data, onChange }) => {
	const handleItemChange = (index: number, patch: Partial<ButtonGroupItem>) => {
		const next = data.items.slice();
		next[index] = { ...next[index], ...patch } as ButtonGroupItem;
		onChange({ items: next });
	};

	const handleAdd = () => {
		const newItem: ButtonGroupItem = {
			id: (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
			text: 'Новая кнопка',
			link: '',
			variant: 'primary',
		};
		onChange({ items: [...data.items, newItem] });
	};

	const handleRemove = (index: number) => {
		const next = data.items.slice();
		next.splice(index, 1);
		onChange({ items: next });
	};

	return (
		<div className="space-y-4">
			<div className="space-y-3">
				{data.items.length === 0 ? (
					<div className="text-sm text-gray-500 dark:text-gray-400">Пока нет кнопок. Добавьте первую.</div>
				) : (
					data.items.map((item, index) => (
						<div key={item.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-3">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<Input
									label="Текст"
									value={item.text}
									onChange={(e) => handleItemChange(index, { text: e.target.value })}
									placeholder="Например: Открыть форум"
								/>
								<Input
									label="Ссылка"
									value={item.link}
									onChange={(e) => handleItemChange(index, { link: e.target.value })}
									placeholder="Например: /forum"
								/>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<Select
									label="Вариант"
									value={item.variant}
									onChange={(e) => handleItemChange(index, { variant: e.target.value as ButtonGroupItem['variant'] })}
								>
									<option value="primary">Primary</option>
									<option value="secondary">Secondary</option>
									<option value="danger">Danger</option>
									<option value="ghost">Ghost</option>
								</Select>
								<div className="flex items-end">
									<Button variant="danger" onClick={() => handleRemove(index)}>Удалить</Button>
								</div>
							</div>
						</div>
					))
				)}
			</div>
			<div>
				<Button onClick={handleAdd}>Добавить кнопку</Button>
			</div>
		</div>
	);
};

// ContainerSection
interface ContainerSectionData { 
	title?: string; 
	layout: 'two' | 'three'; 
}

const ContainerSectionEditor: React.FC<{ data: ContainerSectionData; onChange: (d: ContainerSectionData) => void }> = ({ data, onChange }) => {
	return (
		<div className="space-y-3">
			<Input
				label="Заголовок контейнера"
				value={data.title || ''}
				onChange={(e) => onChange({ ...data, title: e.target.value })}
				placeholder="Например: Основные разделы"
			/>
			<Select
				label="Количество колонок"
				value={data.layout}
				onChange={(e) => onChange({ ...data, layout: e.target.value as 'two' | 'three' })}
			>
				<option value="two">2 колонки</option>
				<option value="three">3 колонки</option>
			</Select>
			<div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
				<div className="text-sm text-blue-700 dark:text-blue-300">
					<strong>Совет:</strong> Перетащите блоки из библиотеки в колонки контейнера для создания вложенной структуры.
				</div>
			</div>
		</div>
	);
};

// Схемы для новых контейнерных блоков
interface TabItem {
	id: string;
	title: string;
}

interface TabsBlockData {
	tabs: TabItem[];
	activeTab?: string;
}

const TabItemSchema = z.object({
	id: z.string().min(1, 'ID вкладки обязателен'),
	title: z.string().min(1, 'Название вкладки обязательно'),
});

const TabsBlockSchema = z.object({
	tabs: z.array(TabItemSchema).min(1, 'Должна быть хотя бы одна вкладка'),
	activeTab: z.string().optional(),
});

interface AccordionItem {
	id: string;
	title: string;
}

interface AccordionBlockData {
	sections: AccordionItem[];
	expandedSections?: string[];
}

const AccordionItemSchema = z.object({
	id: z.string().min(1, 'ID секции обязателен'),
	title: z.string().min(1, 'Название секции обязательно'),
});

const AccordionBlockSchema = z.object({
	sections: z.array(AccordionItemSchema).min(1, 'Должна быть хотя бы одна секция'),
	expandedSections: z.array(z.string()).optional(),
});

// Схемы и данные для атомарных блоков
interface HeadingData {
	text: string;
	level: 1 | 2 | 3 | 4 | 5 | 6;
	align: 'left' | 'center' | 'right';
}

const HeadingSchema = z.object({
	text: z.string().min(1, 'Текст заголовка обязателен'),
	level: z.number().min(1).max(6).default(1),
	align: z.enum(['left', 'center', 'right']).default('left'),
});

interface ParagraphData {
	text: string;
}

const ParagraphSchema = z.object({
	text: z.string().min(1, 'Текст параграфа обязателен'),
});

interface ImageData {
	imageUrl: string;
	altText: string;
}

const ImageSchema = z.object({
	imageUrl: z.string().url('Введите корректный URL').min(1, 'URL изображения обязателен'),
	altText: z.string().default(''),
});

interface SingleButtonData {
	text: string;
	link: string;
	variant: 'primary' | 'secondary' | 'danger' | 'ghost';
	size: 'sm' | 'md' | 'lg';
}

const SingleButtonSchema = z.object({
	text: z.string().min(1, 'Текст кнопки обязателен'),
	link: z.string().default(''),
	variant: z.enum(['primary', 'secondary', 'danger', 'ghost']).default('primary'),
	size: z.enum(['sm', 'md', 'lg']).default('md'),
});

interface SpacerData {
	height: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
	customHeight?: number;
}

const SpacerSchema = z.object({
	height: z.enum(['sm', 'md', 'lg', 'xl', 'custom']).default('md'),
	customHeight: z.number().min(1).max(500).optional(),
});

export const blockRegistry: Record<string, BlockSpec<any>> = {
	header: {
		type: 'header',
		name: 'Шапка',
		defaultData: () => ({}),
		Editor: NoConfigEditor,
		Renderer: Header,
		category: 'Структура',
		icon: 'header',
		tags: ['header', 'layout', 'navigation'],
		description: 'Шапка сайта с навигацией и брендингом.',
		previewData: () => ({}),
		schemaVersion: 1,
		schema: z.object({}),
	},
	categories_section: {
		type: 'categories_section',
		name: 'Разделы форума',
		defaultData: () => ({ title: 'Новый раздел', description: '' }),
		Editor: CategoriesSectionEditor,
		Renderer: CategoriesSection,
		category: 'Игровые виджеты',
		icon: 'categories',
		tags: ['categories', 'forum', 'grid'],
		description: 'Секция со списком/сеткой разделов форума.',
		previewData: () => ({ title: 'Разделы', description: 'Основные категории форума' }),
		schemaVersion: 1,
		schema: CategoriesSectionSchema as unknown as z.ZodType<CategoriesSectionData>,
	},
	controls_section: {
		type: 'controls_section',
		name: 'UI Компоненты',
		defaultData: () => ({ title: 'UI Компоненты' }),
		Editor: ControlsSectionEditor,
		Renderer: ControlsSection,
		category: 'Игровые виджеты',
		icon: 'controls',
		tags: ['controls', 'ui', 'demo'],
		description: 'Демонстрационная секция UI-контролов.',
		previewData: () => ({ title: 'UI Компоненты' }),
		schemaVersion: 1,
		schema: ControlsSectionSchema as unknown as z.ZodType<ControlsSectionData>,
	},
	button_group: {
		type: 'button_group',
		name: 'Группа кнопок',
		defaultData: () => ({
			items: [
				{ id: (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`, text: 'Кнопка', link: '', variant: 'primary' },
			],
		}),
		Editor: ButtonGroupEditor,
		Renderer: ButtonGroup,
		category: 'Базовые',
		icon: 'button-group',
		tags: ['buttons', 'cta', 'actions'],
		description: 'Группа кнопок c настраиваемыми вариантами и ссылками.',
		previewData: () => ({ items: [{ id: 'preview-1', text: 'Подробнее', link: '#', variant: 'primary' }] }),
		schemaVersion: 1,
		schema: ButtonGroupSchema as unknown as z.ZodType<ButtonGroupData>,
	},
	properties_section: {
		type: 'properties_section',
		name: 'Таблица данных',
		defaultData: () => ({ title: 'Недвижимость', subtitle: 'Таблица недвижимости' }),
		Editor: NoConfigEditor,
		Renderer: PropertiesSection,
		category: 'Игровые виджеты',
		icon: 'properties',
		tags: ['properties', 'table', 'data'],
		description: 'Секция с таблицей объектов недвижимости.',
		previewData: () => ({ title: 'Недвижимость', subtitle: 'Каталог объектов' }),
		schemaVersion: 1,
		schema: z.object({ title: z.string(), subtitle: z.string().default('') }),
	},
	animations_section: {
		type: 'animations_section',
		name: 'Анимации',
		defaultData: () => ({ title: 'Анимации', subtitle: 'Таблица анимаций' }),
		Editor: NoConfigEditor,
		Renderer: AnimationsSection,
		category: 'Игровые виджеты',
		icon: 'animations',
		tags: ['animations', 'data', 'table'],
		description: 'Секция со списком анимаций.',
		previewData: () => ({ title: 'Анимации', subtitle: 'Коллекция эффектов' }),
		schemaVersion: 1,
		schema: z.object({ title: z.string(), subtitle: z.string().default('') }),
	},
	changelog_section: {
		type: 'changelog_section',
		name: 'История изменений',
		defaultData: () => ({ title: 'История изменений' }),
		Editor: NoConfigEditor,
		Renderer: ChangelogSection,
		category: 'Игровые виджеты',
		icon: 'changelog',
		tags: ['changelog', 'history', 'timeline'],
		description: 'Секция с историей изменений и активностей.',
		previewData: () => ({ title: 'История изменений' }),
		schemaVersion: 1,
		schema: z.object({ title: z.string().min(1) }),
	},
	container_section: {
		type: 'container_section',
		name: 'Колонки',
		defaultData: () => ({ title: 'Контейнер', layout: 'two' }),
		Editor: ContainerSectionEditor,
		Renderer: ContainerSection as unknown as React.LazyExoticComponent<React.ComponentType<any>>,
		category: 'Структура',
		icon: 'container',
		tags: ['container', 'columns', 'layout'],
		description: 'Контейнерная секция с 2/3 колонками для вложенных блоков.',
		previewData: () => ({ title: 'Контейнер', layout: 'two' }),
		schemaVersion: 1,
		schema: z.object({
			title: z.string().optional(),
			layout: z.enum(['two', 'three']).default('two'),
		}),
		// Поддержка вложенности
		allowedChildren: ['button_group', 'categories_section', 'controls_section', 'properties_section', 'animations_section', 'changelog_section', 'heading', 'paragraph', 'single_image', 'single_button', 'spacer'],
		allowedSlots: ['column1', 'column2', 'column3'],
	},
	
	// Атомарные блоки
	heading: {
		type: 'heading',
		name: 'Заголовок',
		defaultData: () => ({ text: 'Новый заголовок', level: 2, align: 'left' }),
		Editor: HeadingEditor,
		Renderer: LazyHeadingBlock,
		category: 'Базовые',
		icon: 'heading',
		tags: ['heading', 'title', 'text'],
		description: 'Заголовок любого уровня (H1-H6) с настраиваемым выравниванием.',
		previewData: () => ({ text: 'Заголовок', level: 2, align: 'left' }),
		schemaVersion: 1,
		schema: HeadingSchema as unknown as z.ZodType<HeadingData>,
	},
	
	paragraph: {
		type: 'paragraph',
		name: 'Текст',
		defaultData: () => ({ text: 'Введите текст параграфа...' }),
		Editor: ParagraphEditor,
		Renderer: LazyParagraphBlock,
		category: 'Базовые',
		icon: 'paragraph',
		tags: ['text', 'paragraph', 'content', 'markdown'],
		description: 'Текстовый блок с поддержкой базовой Markdown-разметки.',
		previewData: () => ({ text: 'Это пример текста параграфа с **жирным** и *курсивным* текстом.' }),
		schemaVersion: 1,
		schema: ParagraphSchema as unknown as z.ZodType<ParagraphData>,
	},
	
	single_image: {
		type: 'single_image',
		name: 'Изображение',
		defaultData: () => ({ imageUrl: '', altText: '' }),
		Editor: ImageEditor,
		Renderer: LazyImageBlock,
		category: 'Базовые',
		icon: 'image',
		tags: ['image', 'picture', 'media'],
		description: 'Одиночное изображение с альтернативным текстом.',
		previewData: () => ({ imageUrl: 'https://via.placeholder.com/400x200?text=Изображение', altText: 'Пример изображения' }),
		schemaVersion: 1,
		schema: ImageSchema as unknown as z.ZodType<ImageData>,
	},
	
	single_button: {
		type: 'single_button',
		name: 'Кнопка',
		defaultData: () => ({ text: 'Кнопка', link: '', variant: 'primary', size: 'md' }),
		Editor: ButtonEditor,
		Renderer: LazyButtonBlock,
		category: 'Базовые',
		icon: 'button',
		tags: ['button', 'cta', 'link', 'action'],
		description: 'Одиночная кнопка с настраиваемым стилем и ссылкой.',
		previewData: () => ({ text: 'Подробнее', link: '#', variant: 'primary', size: 'md' }),
		schemaVersion: 1,
		schema: SingleButtonSchema as unknown as z.ZodType<SingleButtonData>,
	},
	
	spacer: {
		type: 'spacer',
		name: 'Отступ',
		defaultData: () => ({ height: 'md' }),
		Editor: SpacerEditor,
		Renderer: LazySpacerBlock,
		category: 'Структура',
		icon: 'spacer',
		tags: ['spacer', 'space', 'margin', 'gap'],
		description: 'Вертикальный отступ для создания пространства между блоками.',
		previewData: () => ({ height: 'md' }),
		schemaVersion: 1,
		schema: SpacerSchema as unknown as z.ZodType<SpacerData>,
	},

	// Новые контейнерные компоненты
	tabs_block: {
		type: 'tabs_block',
		name: 'Вкладки',
		defaultData: () => ({
			tabs: [
				{ id: 'tab1', title: 'Вкладка 1' },
				{ id: 'tab2', title: 'Вкладка 2' }
			],
			activeTab: 'tab1'
		}),
		Editor: TabsEditor,
		Renderer: TabsBlock as unknown as React.LazyExoticComponent<React.ComponentType<any>>,
		category: 'Контейнеры',
		icon: 'tabs',
		tags: ['tabs', 'container', 'navigation', 'interactive'],
		description: 'Интерактивный контейнер с вкладками для организации контента.',
		previewData: () => ({
			tabs: [
				{ id: 'tab1', title: 'Правила' },
				{ id: 'tab2', title: 'Ивенты' }
			],
			activeTab: 'tab1'
		}),
		schemaVersion: 1,
		schema: TabsBlockSchema as unknown as z.ZodType<TabsBlockData>,
		// Поддержка вложенности
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
		// allowedSlots будет генерироваться динамически на основе tabs
	},

	accordion_block: {
		type: 'accordion_block',
		name: 'Аккордеон',
		defaultData: () => ({
			sections: [
				{ id: 'section1', title: 'Раздел 1' },
				{ id: 'section2', title: 'Раздел 2' }
			],
			expandedSections: ['section1']
		}),
		Editor: AccordionEditor,
		Renderer: AccordionBlock as unknown as React.LazyExoticComponent<React.ComponentType<any>>,
		category: 'Контейнеры',
		icon: 'accordion',
		tags: ['accordion', 'container', 'collapsible', 'expandable'],
		description: 'Раскрывающийся контейнер для компактного отображения контента.',
		previewData: () => ({
			sections: [
				{ id: 'rules', title: 'Правила' },
				{ id: 'events', title: 'Ивенты' }
			],
			expandedSections: ['rules']
		}),
		schemaVersion: 1,
		schema: AccordionBlockSchema as unknown as z.ZodType<AccordionBlockData>,
		// Поддержка вложенности
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
		// allowedSlots будет генерироваться динамически на основе sections
	},
};
