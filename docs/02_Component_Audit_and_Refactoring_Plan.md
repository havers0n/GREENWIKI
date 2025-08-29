# 02. Component Audit and Refactoring Plan

## Цель документа
Провести полный аудит существующих UI-компонентов, выявить проблемы и составить детальный план рефакторинга для создания чистой, атомарной библиотеки базовых блоков.

## Методика аудита

### 🔍 Критерии оценки компонентов:
1. **Принцип единственной ответственности**: Делает ли компонент только одну вещь?
2. **Атомарность**: Можно ли разбить на более мелкие компоненты?
3. **Композиция**: Принимает ли children вместо жестко зашитой структуры?
4. **Переиспользуемость**: Можно ли использовать в разных контекстах?
5. **Типизация**: Имеет ли корректные TypeScript типы?
6. **Зависимости**: Правильные ли импорты и зависимости?

### 📊 Легенда статусов:
- ✅ **СОХРАНИТЬ**: Компонент хороший, требует минимальных изменений
- 🔄 **РЕФАКТОРИНГ**: Требуется улучшение, но можно сохранить
- ✂️ **РАЗДЕЛИТЬ**: Компонент-монстр, нужно разбить на части
- 🗑️ **УДАЛИТЬ**: Устарел или дублируется
- 🆕 **СОЗДАТЬ**: Отсутствует, но необходим

## Детальный аудит компонентов

### Shared/UI Components (Базовые компоненты)

| Компонент | Текущий путь | Проблемы | Предлагаемое действие | Новое местоположение | Описание изменений |
|-----------|-------------|----------|----------------------|-------------------|-------------------|
| **Button** | `@my-forum/ui` | ✅ Нет проблем | ✅ СОХРАНИТЬ | `shared/ui/atoms/Button/` | - |
| **Input** | `@my-forum/ui` | ✅ Нет проблем | ✅ СОХРАНИТЬ | `shared/ui/atoms/Input/` | - |
| **Select** | `@my-forum/ui` | ✅ Нет проблем | ✅ СОХРАНИТЬ | `shared/ui/atoms/Select/` | - |
| **Card** | `shared/ui/atoms/Card.tsx` | ✅ Хорошо структурирован | ✅ СОХРАНИТЬ | `shared/ui/atoms/Card/` | - |
| **Icon** | `shared/ui/atoms/Icon.tsx` | ✅ Хорошо структурирован | ✅ СОХРАНИТЬ | `shared/ui/atoms/Icon/` | - |
| **Typography** | `shared/ui/atoms/Typography.tsx` | ✅ Хорошо структурирован | ✅ СОХРАНИТЬ | `shared/ui/atoms/Typography/` | - |
| **Modal** | `shared/ui/molecules/Modal.tsx` | ✅ Хорошо структурирован | ✅ СОХРАНИТЬ | `shared/ui/molecules/Modal/` | - |
| **SearchInput** | `shared/ui/molecules/SearchInput.tsx` | ✅ Хорошо структурирован | ✅ СОХРАНИТЬ | `shared/ui/molecules/SearchInput/` | - |

### Widgets Components (Крупные компоненты)

| Компонент | Текущий путь | Проблемы | Предлагаемое действие | Новое местоположение | Описание изменений |
|-----------|-------------|----------|----------------------|-------------------|-------------------|
| **ContainerSection** | `widgets/ContainerSection/` | 🔴 337 строк, смешанная логика<br>🔴 Содержит бизнес-логику получения дочерних блоков<br>🔴 Не принимает children | ✂️ РАЗДЕЛИТЬ | `blocks/layout/ContainerBlock/` | Разделить на:<br>- ContainerBlock (чистый UI)<br>- ContainerBlockEditor (редактор)<br>- useContainerLogic (хуки логики) |
| **ContextualInspector** | `widgets/ContextualInspector/` | 🔴 337+ строк<br>🔴 Множество ответственностей<br>🔴 Смешивает UI и бизнес-логику | ✂️ РАЗДЕЛИТЬ | `widgets/ContextualInspector/` | Разделить на:<br>- InspectorTabs<br>- PropertyControls<br>- BlockNavigation<br>- StyleControls |
| **ReusableBlocksLibrary** | `features/ReusableBlocksLibrary/` | 🔴 250+ строк<br>🔴 Смешивает UI и бизнес-логику<br>🔴 Слишком много состояний | ✂️ РАЗДЕЛИТЬ | `features/ReusableBlocksLibrary/` | Разделить на:<br>- LibraryModal (UI)<br>- BlockFilters (фильтры)<br>- BlockGrid (сетка)<br>- useBlockLibrary (логика) |
| **BlockRenderer** | `widgets/BlockRenderer/ui/` | ✅ Хорошо структурирован | 🔄 РЕФАКТОРИНГ | `blocks/core/BlockRenderer/` | Улучшить типизацию<br>Добавить error boundaries |
| **Header** | `widgets/Header.tsx` | ✅ Хорошо структурирован | ✅ СОХРАНИТЬ | `widgets/Header/` | Минимальные изменения |
| **EditorToolbar** | `widgets/EditorToolbar/` | 🔴 Содержит жестко зашитые кнопки | 🔄 РЕФАКТОРИНГ | `widgets/EditorToolbar/` | Сделать конфигурируемым через props |
| **SettingsForm** | `widgets/SettingsForm/` | 🔴 Смешивает валидацию и UI | ✂️ РАЗДЕЛИТЬ | `widgets/SettingsForm/` | Разделить на компоненты формы и логику валидации |

### AtomicBlocks Components (CMS-специфичные блоки)

| Компонент | Текущий путь | Проблемы | Предлагаемое действие | Новое местоположение | Описание изменений |
|-----------|-------------|----------|----------------------|-------------------|-------------------|
| **ButtonBlock** | `widgets/AtomicBlocks/ButtonBlock/` | 🔴 Дублирует логику Button<br>🔴 Генерирует стили в runtime<br>🔴 Не переиспользует базовый Button | ✂️ РАЗДЕЛИТЬ | `blocks/atomic/ButtonBlock/` | Разделить на:<br>- ButtonBlock (чистый блок)<br>- ButtonBlockEditor (редактор)<br>- Убрать дублирование логики |
| **HeadingBlock** | `widgets/AtomicBlocks/HeadingBlock/` | 🔴 Жестко зашитые стили | 🔄 РЕФАКТОРИНГ | `blocks/atomic/HeadingBlock/` | Использовать Typography компонент<br>Сделать конфигурируемым |
| **ImageBlock** | `widgets/AtomicBlocks/ImageBlock/` | 🔴 Отсутствует типизация<br>🔴 Нет обработки ошибок | 🔄 РЕФАКТОРИНГ | `blocks/atomic/ImageBlock/` | Добавить типы<br>Добавить error handling<br>Оптимизировать загрузку |
| **ParagraphBlock** | `widgets/AtomicBlocks/ParagraphBlock/` | 🔴 Жестко зашитые стили | 🔄 РЕФАКТОРИНГ | `blocks/atomic/ParagraphBlock/` | Использовать Typography<br>Добавить rich text поддержку |
| **SpacerBlock** | `widgets/AtomicBlocks/SpacerBlock/` | ✅ Простой и чистый | ✅ СОХРАНИТЬ | `blocks/atomic/SpacerBlock/` | Минимальные улучшения |

### Features Components (Компоненты с логикой)

| Компонент | Текущий путь | Проблемы | Предлагаемое действие | Новое местоположение | Описание изменений |
|-----------|-------------|----------|----------------------|-------------------|-------------------|
| **CreateCategoryModal** | `features/CreateCategoryModal/` | 🔴 Смешивает форму и модальное окно | ✂️ РАЗДЕЛИТЬ | `features/CreateCategoryModal/` | Разделить на:<br>- CreateCategoryForm<br>- Modal wrapper |
| **EditPageModal** | `features/EditPageModal/` | 🔴 Аналогичные проблемы | ✂️ РАЗДЕЛИТЬ | `features/EditPageModal/` | Аналогичный рефакторинг |
| **TemplatesManager** | `features/TemplatesManager/` | ✅ Хорошо структурирован | ✅ СОХРАНИТЬ | `features/TemplatesManager/` | - |

### Entities Components (Бизнес-сущности)

| Компонент | Текущий путь | Проблемы | Предлагаемое действие | Новое местоположение | Описание изменений |
|-----------|-------------|----------|----------------------|-------------------|-------------------|
| **CategoryCard** | `entities/category/ui/CategoryCard.tsx` | ✅ Хорошо структурирован | ✅ СОХРАНИТЬ | `entities/category/ui/CategoryCard/` | - |
| **ChangelogCard** | `entities/changelog/ui/ChangelogCard.tsx` | ✅ Хорошо структурирован | ✅ СОХРАНИТЬ | `entities/changelog/ui/ChangelogCard/` | - |
| **PropertyCard** | `entities/property/ui/PropertyCard.tsx` | ✅ Хорошо структурирован | ✅ СОХРАНИТЬ | `entities/property/ui/PropertyCard/` | - |

## Детальный план рефакторинга по компонентам

### 1. ContainerSection → ContainerBlock (Приоритет: Высокий)

**Текущие проблемы:**
- 337 строк кода в одном файле
- Смешивает логику получения дочерних блоков с UI
- Не поддерживает композицию через children
- Содержит editor-специфичные props

**План рефакторинга:**
```typescript
// 1. Создать базовый ContainerBlock
blocks/layout/ContainerBlock/ui/ContainerBlock.tsx
interface ContainerBlockProps {
  children: React.ReactNode;
  layout?: 'vertical' | 'horizontal' | 'grid';
  gap?: 'none' | 'small' | 'medium' | 'large';
  padding?: 'none' | 'small' | 'medium' | 'large';
  backgroundColor?: string;
  className?: string;
}

// 2. Создать ContainerBlockEditor для CMS
blocks/layout/ContainerBlock/ui/ContainerBlockEditor.tsx
interface ContainerBlockEditorProps extends ContainerBlockProps {
  blockId: string;
  allBlocks: any[];
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string | null) => void;
  onUpdateBlock?: (block: any) => void;
}

// 3. Вынести логику в кастомные хуки
blocks/layout/ContainerBlock/model/useContainerLogic.ts
export const useContainerLogic = (blockId: string, allBlocks: any[]) => {
  const childBlocks = useMemo(() => {
    return allBlocks.filter(block =>
      block.parent_block_id === blockId && (!block.slot || block.slot === 'default')
    );
  }, [blockId, allBlocks]);

  return { childBlocks };
};
```

### 2. ContextualInspector → Inspector Components (Приоритет: Высокий)

**Текущие проблемы:**
- 337+ строк в одном компоненте
- Множество вкладок и контроллов в одном файле
- Сложная логика переключения между режимами
- Тесная связь с Redux store

**План рефакторинга:**
```typescript
// Разбить на отдельные компоненты:
widgets/ContextualInspector/
├── ui/
│   ├── InspectorTabs.tsx          # Основные вкладки
│   ├── PropertyControls.tsx       # Контролы свойств
│   ├── StyleControls.tsx          # Стили
│   ├── BlockNavigation.tsx        # Навигация по блокам
│   └── InspectorHeader.tsx        # Заголовок инспектора
├── model/
│   ├── useInspectorState.ts       # Управление состоянием
│   └── types.ts                   # Типы инспектора
└── index.tsx                      # Главный компонент-композитор
```

### 3. ButtonBlock → Clean ButtonBlock (Приоритет: Средний)

**Текущие проблемы:**
- Дублирует логику обработки кликов из базового Button
- Генерирует стили в runtime вместо использования CSS-in-JS
- Не переиспользует возможности базового Button

**План рефакторинга:**
```typescript
// 1. Очистить ButtonBlock от дублированной логики
blocks/atomic/ButtonBlock/ui/ButtonBlock.tsx
interface ButtonBlockProps {
  text: string;
  link?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  // Убрать metadata - использовать className
}

// 2. Создать ButtonBlockEditor
blocks/atomic/ButtonBlock/ui/ButtonBlockEditor.tsx
// Специфичный для CMS редактор

// 3. Убрать дублирование логики кликов
// Весь handling должен быть в базовом Button компоненте
```

### 4. BlockRenderer Improvements (Приоритет: Средний)

**Текущие проблемы:**
- Недостаточная типизация
- Отсутствие error boundaries
- Нет оптимизации для больших деревьев

**План рефакторинга:**
```typescript
// Добавить error boundary
blocks/core/BlockRenderer/ui/ErrorBoundary.tsx

// Улучшить типизацию
blocks/core/BlockRenderer/model/types.ts

// Добавить виртуализацию для больших списков
blocks/core/BlockRenderer/ui/VirtualizedBlockRenderer.tsx
```

## План создания недостающих компонентов

### 🆕 Необходимые базовые компоненты:

1. **DropZone** - универсальная зона сброса для D&D
2. **BlockWrapper** - обертка для всех блоков с общими функциями
3. **LoadingState** - компонент состояния загрузки
4. **ErrorState** - компонент состояния ошибки
5. **EmptyState** - компонент пустого состояния

### 🆕 Layout компоненты для CMS:

1. **FlexContainer** - flexbox контейнер
2. **GridContainer** - grid контейнер
3. **Section** - секция с отступами
4. **Column** - колонка для сеток

## Оценка трудозатрат

### Фаза 1: Базовые компоненты (1-2 недели)
- Создание недостающих атомов и молекул
- Рефакторинг существующих базовых компонентов
- Создание системы типов

### Фаза 2: Layout блоки (1 неделя)
- ContainerBlock, Section, Column
- DropZone и BlockWrapper
- Интеграция с D&D системой

### Фаза 3: Рефакторинг крупных компонентов (2-3 недели)
- ContextualInspector → компоненты
- ReusableBlocksLibrary → разделение
- ContainerSection → ContainerBlock
- ButtonBlock и другие atomic blocks

### Фаза 4: Интеграция и тестирование (1 неделя)
- Обновление всех импортов
- Интеграционное тестирование
- Оптимизация производительности

## Критерии успешного рефакторинга

### ✅ Функциональные критерии:
- [ ] Все компоненты принимают children через props.children
- [ ] Нет дублирования логики между компонентами
- [ ] Каждый компонент имеет единственную ответственность
- [ ] Все компоненты правильно типизированы

### ✅ Архитектурные критерии:
- [ ] Четкое разделение по Atomic Design
- [ ] Правильная иерархия импортов
- [ ] Компоненты изолированы по слоям
- [ ] Легко тестировать каждый компонент отдельно

### ✅ Производительность:
- [ ] Компоненты оптимизированы для перерендеринга
- [ ] Используются React.memo где необходимо
- [ ] Минимальные зависимости

## Следующие шаги

После завершения аудита и планирования, переходите к:
1. **Документу 3**: Создание спецификации базовой библиотеки блоков
2. **Практической реализации**: Начать с самых критичных компонентов
3. **Тестированию**: Писать тесты параллельно с рефакторингом

---

**Вывод**: Аудит выявил, что около 60% компонентов требуют значительного рефакторинга. Основные проблемы: компоненты-монстры, смешанная ответственность и отсутствие композиции. План рефакторинга позволит создать чистую, переиспользуемую библиотеку блоков, готовую для Drag & Drop функциональности.
