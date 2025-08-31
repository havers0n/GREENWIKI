# Аудит системы блоков CMS

## Обзор системы блоков

Система блоков построена на паттерне **реестра блоков** с разделением на:
- **Атомарные блоки** - простые элементы контента
- **Layout блоки** - контейнеры для организации структуры
- **Интерактивные блоки** - сложные компоненты с состоянием

### Архитектурные принципы

```
Block Registry → Block Type → Component Mapping
       ↓
Editor Components ← Features Layer
       ↓
Renderer Components ← Widgets Layer
```

## Карта блоков: block_type → компонент

### Атомарные блоки (9 блоков)

| Block Type | Название | Категория | Editor Component | Renderer Component | Статус |
|------------|----------|-----------|------------------|-------------------|--------|
| `heading` | Заголовок | Контент | `HeadingEditor` | `LazyHeadingBlock` | ✅ Активен |
| `text` | Текст | Контент | `ParagraphEditor` | `LazyParagraphBlock` | ✅ Активен |
| `image` | Изображение | Контент | `ImageEditor` | `LazyImageBlock` | ✅ Активен |
| `single_button` | Кнопка | Контент | `ButtonBlockEditorAdapter` | `LazyButtonBlock` | ✅ Активен |
| `spacer` | Отступ | Структура | `SpacerEditor` | `LazySpacerBlock` | ✅ Активен |
| `icon` | Иконка | Контент | `IconEditor` | `LazyIconBlock` | ✅ Активен |
| `section` | Секция | Структура | `SectionEditor` | `LazySectionBlock` | ✅ Активен |

### Layout блоки (2 блока)

| Block Type | Название | Категория | Editor Component | Renderer Component | Статус |
|------------|----------|-----------|------------------|-------------------|--------|
| `container` | Контейнер | Структура | Inline Editor | `ContainerSection` | ✅ Активен |
| `columns` | Колонки | Структура | `ColumnsBlockEditor` | `ColumnsBlock` | ✅ Активен |

### Интерактивные блоки (2 блока)

| Block Type | Название | Категория | Editor Component | Renderer Component | Статус |
|------------|----------|-----------|------------------|-------------------|--------|
| `tabs` | Вкладки | Структура | `TabsEditor` | `TabsBlock` | ✅ Активен |
| `accordion` | Аккордеон | Структура | `AccordionEditor` | `AccordionBlock` | ✅ Активен |

### Композитные блоки (1 блок)

| Block Type | Название | Категория | Editor Component | Renderer Component | Статус |
|------------|----------|-----------|------------------|-------------------|--------|
| `card` | Карточка | Композиты | Inline Editor | `CardSection` | ✅ Активен |

## Структура компонентов блоков

### Атомарные блоки: паттерн FSD

```
blocks/atomic/{BlockName}/
├── ui/
│   ├── {BlockName}.tsx          # Основной компонент рендерера
│   ├── {BlockName}Editor.tsx    # Редактор (если нужен)
│   └── {BlockName}Link.tsx      # Дополнительные компоненты
├── model/
│   ├── use{BlockName}Logic.ts   # Бизнес-логика (хуки)
│   └── use{BlockName}Styles.ts  # Стилизация (хуки)
├── types.ts                     # TypeScript типы
└── index.ts                     # Экспорт
```

### Layout блоки: расширенная структура

```
blocks/layout/{BlockName}/
├── ui/
│   ├── {BlockName}.tsx          # Основной компонент
│   └── {BlockName}Editor.tsx    # Редактор свойств
├── model/
│   └── use{BlockName}Logic.ts   # Логика layout
├── types.ts                     # Типы
├── example.tsx                  # Примеры использования
└── index.ts                     # Экспорт
```

## Схемы данных и валидация

### Zod-схемы валидации

```typescript
// Пример схемы для HeadingBlock
const HeadingSchema = z.object({
  text: z.string().min(1, 'Текст заголовка обязателен'),
  level: z.number().min(1).max(6).default(1),
  align: z.enum(['left', 'center', 'right']).default('left'),
});

// Пример схемы для TabsBlock
const TabsBlockSchema = z.object({
  tabs: z.array(TabItemSchema).min(1, 'Должна быть хотя бы одна вкладка'),
  activeTab: z.string().optional(),
});
```

### Типы данных блоков

```typescript
interface HeadingData {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  align: 'left' | 'center' | 'right';
}

interface TabsBlockData {
  tabs: TabItem[];
  activeTab?: string;
}
```

## Правила вложенности блоков

### Разрешенные комбинации

| Родительский блок | Допустимые дочерние блоки |
|-------------------|---------------------------|
| `columns` | Все блоки (heading, text, image, button, spacer, section, container, columns, tabs, accordion, card, icon) |
| `section` | heading, text, image, button, spacer, section, container, columns, tabs, accordion, card, icon |
| `container` | heading, text, image, button, spacer, section, container, columns, tabs, accordion, card, icon |
| `tabs` | heading, text, image, button, spacer, section, container, columns, accordion, card, icon |
| `accordion` | heading, text, image, button, spacer, section, container, columns, tabs, card, icon |
| `card` | heading, text, image, button, spacer, icon |

### Слоты для вложенности

- **columns**: `column1`, `column2`, `column3`, `column4`
- **tabs**: динамически генерируются на основе `tabs` массива
- **accordion**: динамически генерируются на основе `sections` массива
- **card**: `header`, `content`, `footer`
- **container**: `default`

## DnD и Drag & Drop система

### Интеграция с @dnd-kit

```typescript
// Пример использования в ButtonBlock
const ButtonBlock: React.FC<ButtonBlockProps> = ({ blockId, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: blockId,
    data: { type: 'block', blockId }
  });

  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      {/* Контент блока */}
    </div>
  );
};
```

### Зоны сброса (Drop Zones)

```typescript
// В BlockRenderer
<DropZone
  parentId={block.id}
  slot="content"
  allowedTypes={allowedChildren}
/>
```

## Preview и превью-система

### Данные для превью

```typescript
// В blockRegistry
previewData: () => ({
  text: 'Заголовок',
  level: 2,
  align: 'left'
})
```

### Ленивые импорты для оптимизации

```typescript
// В blockRegistry
Renderer: React.lazy(() => import('widgets/AtomicBlocks/HeadingBlock'))
```

## Категории и организация блоков

### Структура категорий

```
📚 Контент (6 блоков)
  ├── heading - Заголовок
  ├── text - Текст
  ├── image - Изображение
  ├── single_button - Кнопка
  ├── icon - Иконка
  └── spacer - Отступ

🏗️ Структура (4 блока)
  ├── section - Секция
  ├── container - Контейнер
  ├── columns - Колонки
  └── card - Карточка

🎯 Интерактивные (2 блока)
  ├── tabs - Вкладки
  └── accordion - Аккордеон
```

## Анализ покрытия блоков

### Соответствие UI и БД

| Block Type (UI) | Block Type (БД) | Статус соответствия |
|-----------------|------------------|---------------------|
| `heading` | `heading` | ✅ Полное |
| `text` | `text` | ✅ Полное |
| `image` | `image` | ✅ Полное |
| `single_button` | `single_button` | ✅ Полное |
| `spacer` | `spacer` | ✅ Полное |
| `icon` | `icon` | ✅ Полное |
| `section` | `section` | ✅ Полное |
| `container` | `container` | ✅ Полное |
| `columns` | `columns` | ✅ Полное |
| `tabs` | `tabs` | ✅ Полное |
| `accordion` | `accordion` | ✅ Полное |
| `card` | `card` | ✅ Полное |

### Отсутствующие блоки в UI

Из анализа БД (`database-setup.sql`) обнаружены несоответствия:

1. **Отсутствующие типы блоков**:
   - `container_section` - определен в константах, но не реализован
   - `tab` - упомянут в константах, но не используется

2. **Неиспользуемые типы**:
   - `SINGLE_BUTTON` vs `single_button` - несогласованность регистра

## Анти-паттерны в системе блоков

### Обнаруженные проблемы:

1. **Смешение логики редакторов**:
   - Некоторые редакторы определены inline в `blockRegistry.tsx`
   - Другие вынесены в отдельные компоненты в `features/BlockEditors/`

2. **Дублирование схем**:
   - Zod-схемы определены в `blockRegistry.tsx`
   - Аналогичные типы могут быть в отдельных файлах

3. **Неоднородная структура**:
   - Атомарные блоки используют FSD паттерн
   - Layout блоки имеют смешанную структуру

4. **Проблемы с ленивыми импортами**:
   ```typescript
   // Неконсистентные пути импорта
   import('../../blocks/layout/ContainerBlock')
   import('widgets/TabsBlock')
   ```

## Рекомендации по улучшению

### 1. Унификация структуры блоков

```
blocks/
├── atomic/           # Атомарные блоки
├── layout/           # Layout блоки
├── interactive/      # Интерактивные блоки
└── composite/        # Композитные блоки

Каждый блок должен иметь:
├── ui/
│   ├── Renderer.tsx
│   └── Editor.tsx
├── model/
│   ├── logic.ts
│   └── styles.ts
├── types.ts
├── schema.ts
├── index.ts
└── example.tsx
```

### 2. Централизация схем валидации

```typescript
// blocks/schemas/
export const HeadingSchema = z.object({...});
export const TabsSchema = z.object({...});
```

### 3. Улучшение системы импортов

```typescript
// blocks/registry/
export const blockRegistry = {
  heading: {
    Renderer: lazy(() => import('../atomic/Heading/ui/Renderer')),
    Editor: lazy(() => import('../atomic/Heading/ui/Editor')),
    schema: HeadingSchema,
  }
};
```

### 4. Строгая типизация

```typescript
// blocks/types/
export interface BlockDataMap {
  heading: HeadingData;
  tabs: TabsData;
  // ...
}

export type BlockType = keyof BlockDataMap;
export type BlockData<T extends BlockType> = BlockDataMap[T];
```

## Заключение

Система блоков имеет **хорошую архитектурную основу** с четким разделением на категории и паттернами рендеринга. Однако требует **стандартизации структуры** и **унификации подходов** к реализации блоков.

**Ключевые достижения**:
- Полное покрытие основных типов блоков
- Работающая система вложенности
- Интеграция DnD
- Zod валидация данных

**Области для улучшения**:
- Унификация структуры компонентов
- Централизация схем валидации
- Улучшение системы импортов
- Строгая типизация связей блоков
