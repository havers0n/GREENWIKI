import React from 'react';
import { z } from 'zod';
import { Input, Textarea, Select } from '@my-forum/ui';

// Импорт редакторов блоков
import { HeadingEditor, ParagraphEditor, ImageEditor, SpacerEditor, TabsEditor, AccordionEditor, SectionEditor, IconEditor } from 'features/BlockEditors';
import { ColumnsBlockEditor } from '../../blocks/layout/ColumnsBlock';
import { ButtonBlockEditor } from '../../blocks/atomic/ButtonBlock';

// Адаптер для ButtonBlockEditor
const ButtonBlockEditorAdapter: React.FC<{ data: any; onChange: (data: any) => void }> = ({ data, onChange }) => {
  return <ButtonBlockEditor text={data.content?.text} metadata={data.metadata} onClick={() => onChange(data)} />;
};

// Ленивые импорты рендереров блоков
const ContainerSection = React.lazy(() => import('../../blocks/layout/ContainerBlock').then(module => ({ default: module.ContainerSectionEditor })));
const ColumnsBlock = React.lazy(() => import('../../blocks/layout/ColumnsBlock').then(module => ({ default: module.ColumnsBlock })));
const TabsBlock = React.lazy(() => import('widgets/TabsBlock'));
const AccordionBlock = React.lazy(() => import('widgets/AccordionBlock'));

// Новые композитные блоки
const CardSection = React.lazy(() => import('widgets/CardSection'));

// Ленивые импорты атомарных блоков
const LazyHeadingBlock = React.lazy(() => import('widgets/AtomicBlocks/HeadingBlock'));
const LazyParagraphBlock = React.lazy(() => import('widgets/AtomicBlocks/ParagraphBlock'));
const LazyImageBlock = React.lazy(() => import('widgets/AtomicBlocks/ImageBlock'));
const LazyButtonBlock = React.lazy(() => import('../../blocks/atomic/ButtonBlock').then(module => ({ default: module.ButtonBlock })));
const LazySpacerBlock = React.lazy(() => import('widgets/AtomicBlocks/SpacerBlock'));
const LazySectionBlock = React.lazy(() => import('widgets/AtomicBlocks/SectionBlock'));
const LazyIconBlock = React.lazy(() => import('widgets/AtomicBlocks/IconBlock'));

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
	/** Может ли блок содержать дочерние блоки (для обратной совместимости) */
	canHaveChildren?: boolean;
}

// Редактор для блоков без настраиваемых параметров







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







	columns: {
		type: 'columns',
		name: 'Колонки',
		defaultData: () => ({ layout: 'three' }),
		Editor: ColumnsBlockEditor,
		Renderer: ColumnsBlock,
		category: 'Структура',
		icon: 'columns',
		tags: ['columns', 'layout', 'grid'],
		description: 'Гибкий контейнер с колонками для создания многоколоночных макетов.',
		previewData: () => ({ layout: 'three' }),
		schemaVersion: 1,
		schema: z.object({
			layout: z.enum(['two', 'three', 'four']).default('three'),
		}),
		// Поддержка вложенности - можно вкладывать любые блоки
		allowedChildren: ['heading', 'paragraph', 'image', 'button', 'spacer', 'section', 'container', 'columns', 'tabs', 'accordion', 'card', 'icon'],
		allowedSlots: ['column1', 'column2', 'column3', 'column4'],
	},
	
	// Атомарные блоки
	heading: {
		type: 'heading',
		name: 'Заголовок',
		defaultData: () => ({ text: 'Новый заголовок', level: 2, align: 'left' }),
		Editor: HeadingEditor,
		Renderer: LazyHeadingBlock,
		category: 'Контент',
		icon: 'heading',
		tags: ['heading', 'title', 'text', 'hierarchy'],
		description: 'Заголовок любого уровня (H1-H6) с настраиваемым выравниванием.',
		previewData: () => ({ text: 'Заголовок', level: 2, align: 'left' }),
		schemaVersion: 1,
		schema: HeadingSchema as unknown as z.ZodType<HeadingData>,
	},
	
	text: {
		type: 'text',
		name: 'Текст',
		defaultData: () => ({ text: 'Введите текст...' }),
		Editor: ParagraphEditor,
		Renderer: LazyParagraphBlock,
		category: 'Контент',
		icon: 'text',
		tags: ['text', 'paragraph', 'content', 'markdown'],
		description: 'Текстовый блок с поддержкой базовой Markdown-разметки.',
		previewData: () => ({ text: 'Это пример текста с **жирным** и *курсивным* оформлением.' }),
		schemaVersion: 1,
		schema: ParagraphSchema as unknown as z.ZodType<ParagraphData>,
	},
	
	image: {
		type: 'image',
		name: 'Изображение',
		defaultData: () => ({ imageUrl: '', altText: '' }),
		Editor: ImageEditor,
		Renderer: LazyImageBlock,
		category: 'Контент',
		icon: 'image',
		tags: ['image', 'picture', 'media', 'photo'],
		description: 'Изображение с альтернативным текстом для доступности.',
		previewData: () => ({ imageUrl: 'https://via.placeholder.com/400x200?text=Изображение', altText: 'Пример изображения' }),
		schemaVersion: 1,
		schema: ImageSchema as unknown as z.ZodType<ImageData>,
	},
	
	single_button: {
		type: 'single_button',
		name: 'Кнопка',
		defaultData: () => ({ text: 'Кнопка', link: '', variant: 'primary', size: 'md' }),
		Editor: ButtonBlockEditorAdapter,
		Renderer: LazyButtonBlock,
		category: 'Контент',
		icon: 'button',
		tags: ['button', 'cta', 'link', 'action', 'click'],
		description: 'Интерактивная кнопка с настраиваемым стилем и действием.',
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

	// Section block
	section: {
		type: 'section',
		name: 'Секция',
		defaultData: () => ({
			backgroundColor: '#ffffff',
			padding: 'medium' as const,
			maxWidth: '1200px'
		}),
		Editor: SectionEditor,
		Renderer: LazySectionBlock,
		category: 'Структура',
		icon: 'section',
		tags: ['section', 'container', 'layout', 'background'],
		description: 'Базовая секция с фоновым цветом и отступами для группировки контента.',
		previewData: () => ({
			backgroundColor: '#f8f9fa',
			padding: 'medium',
			maxWidth: '1200px'
		}),
		schemaVersion: 1,
		schema: z.object({
			backgroundColor: z.string().optional(),
			padding: z.enum(['none', 'small', 'medium', 'large']).default('medium'),
			maxWidth: z.string().default('1200px'),
		}),
		allowedChildren: [
			'heading', 'text', 'image', 'button', 'spacer',
			'section', 'container', 'columns', 'tabs', 'accordion', 'card', 'icon'
		],
	},

	// Icon block
	icon: {
		type: 'icon',
		name: 'Иконка',
		defaultData: () => ({
			icon: '🚀',
			size: 'medium' as const,
			color: '#000000'
		}),
		Editor: IconEditor,
		Renderer: LazyIconBlock,
		category: 'Контент',
		icon: 'icon',
		tags: ['icon', 'emoji', 'symbol', 'visual'],
		description: 'Иконка или emoji для визуального оформления контента.',
		previewData: () => ({
			icon: '⭐',
			size: 'medium',
			color: '#fbbf24'
		}),
		schemaVersion: 1,
		schema: z.object({
			icon: z.string().min(1, 'Иконка обязательна'),
			size: z.enum(['small', 'medium', 'large', 'xl']).default('medium'),
			color: z.string().default('#000000'),
		}),
	},

	// Новые контейнерные компоненты
	tabs: {
		type: 'tabs',
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
		category: 'Структура',
		icon: 'tabs',
		tags: ['tabs', 'navigation', 'organization', 'interactive'],
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
			'heading', 'text', 'image', 'button', 'spacer',
			'section', 'container', 'columns', 'accordion', 'card', 'icon'
		],
		// allowedSlots будет генерироваться динамически на основе tabs
	},

	accordion: {
		type: 'accordion',
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
		category: 'Структура',
		icon: 'accordion',
		tags: ['accordion', 'collapsible', 'expandable', 'interactive'],
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
			'heading', 'text', 'image', 'button', 'spacer',
			'section', 'container', 'columns', 'tabs', 'card', 'icon'
		],
		// allowedSlots будет генерироваться динамически на основе sections
	},

	// Новые композитные блоки с поддержкой вложенности

	// Универсальный контейнер
	container: {
		type: 'container',
		name: 'Контейнер',
		defaultData: () => ({
			title: '',
			layout: 'vertical' as const,
			gap: 'medium' as const,
			padding: 'medium' as const,
			backgroundColor: '',
			borderRadius: '',
			maxWidth: '',
		}),
		Editor: ({ data, onChange }: { data: any; onChange: (data: any) => void }) => (
			<div className="space-y-4">
				<Input
					label="Заголовок контейнера"
					value={data.title || ''}
					onChange={(e) => onChange({ ...data, title: e.target.value })}
					placeholder="Необязательный заголовок"
				/>
				<Select
					label="Layout"
					value={data.layout || 'vertical'}
					onChange={(e) => onChange({ ...data, layout: e.target.value })}
				>
					<option value="vertical">Вертикальный</option>
					<option value="horizontal">Горизонтальный</option>
					<option value="grid">Сетка</option>
				</Select>
				<Select
					label="Отступы между элементами"
					value={data.gap || 'medium'}
					onChange={(e) => onChange({ ...data, gap: e.target.value })}
				>
					<option value="none">Без отступов</option>
					<option value="small">Маленькие</option>
					<option value="medium">Средние</option>
					<option value="large">Большие</option>
				</Select>
				<Select
					label="Внутренние отступы"
					value={data.padding || 'medium'}
					onChange={(e) => onChange({ ...data, padding: e.target.value })}
				>
					<option value="none">Без отступов</option>
					<option value="small">Маленькие</option>
					<option value="medium">Средние</option>
					<option value="large">Большие</option>
				</Select>
				<Input
					label="Цвет фона"
					type="color"
					value={data.backgroundColor || '#ffffff'}
					onChange={(e) => onChange({ ...data, backgroundColor: e.target.value })}
				/>
				<Input
					label="Скругление углов (CSS)"
					value={data.borderRadius || ''}
					onChange={(e) => onChange({ ...data, borderRadius: e.target.value })}
					placeholder="например: 8px или 1rem"
				/>
				<Input
					label="Максимальная ширина"
					value={data.maxWidth || ''}
					onChange={(e) => onChange({ ...data, maxWidth: e.target.value })}
					placeholder="например: 1200px или 80%"
				/>
			</div>
		),
		Renderer: ContainerSection,
		category: 'Структура',
		icon: '📦',
		tags: ['контейнер', 'группа', 'layout'],
		description: 'Универсальный контейнер для группировки блоков с различными layout',
		canHaveChildren: true,
		allowedChildren: [
			'heading', 'text', 'image', 'button', 'spacer',
			'section', 'container', 'columns', 'tabs', 'accordion', 'card', 'icon'
		],
		allowedSlots: ['default'],
	},

	// Карточка
	card: {
		type: 'card',
		name: 'Карточка',
		defaultData: () => ({
			title: '',
			description: '',
			variant: 'default' as const,
			size: 'medium' as const,
			showHeader: true,
			showFooter: false,
		}),
		Editor: ({ data, onChange }: { data: any; onChange: (data: any) => void }) => (
			<div className="space-y-4">
				<Input
					label="Заголовок карточки"
					value={data.title || ''}
					onChange={(e) => onChange({ ...data, title: e.target.value })}
					placeholder="Заголовок"
				/>
				<Textarea
					label="Описание"
					value={data.description || ''}
					onChange={(e) => onChange({ ...data, description: e.target.value })}
					placeholder="Краткое описание карточки"
					rows={3}
				/>
				<Select
					label="Вариант стиля"
					value={data.variant || 'default'}
					onChange={(e) => onChange({ ...data, variant: e.target.value })}
				>
					<option value="default">По умолчанию</option>
					<option value="elevated">Приподнятая</option>
					<option value="outlined">Обведенная</option>
					<option value="filled">Заполненная</option>
				</Select>
				<Select
					label="Размер"
					value={data.size || 'medium'}
					onChange={(e) => onChange({ ...data, size: e.target.value })}
				>
					<option value="small">Маленький</option>
					<option value="medium">Средний</option>
					<option value="large">Большой</option>
				</Select>
				<div className="flex items-center space-x-4">
					<label className="flex items-center">
						<input
							type="checkbox"
							checked={data.showHeader !== false}
							onChange={(e) => onChange({ ...data, showHeader: e.target.checked })}
							className="mr-2"
						/>
						Отображать заголовок
					</label>
					<label className="flex items-center">
						<input
							type="checkbox"
							checked={data.showFooter || false}
							onChange={(e) => onChange({ ...data, showFooter: e.target.checked })}
							className="mr-2"
						/>
						Отображать футер
					</label>
				</div>
			</div>
		),
		Renderer: CardSection,
		category: 'Композиты',
		icon: '🃏',
		tags: ['карточка', 'контейнер', 'группа'],
		description: 'Карточка с заголовком, контентом и футером для группировки элементов',
		allowedChildren: [
			'heading', 'text', 'image', 'button', 'spacer', 'icon'
		],
		allowedSlots: ['header', 'content', 'footer'],
	},


};
