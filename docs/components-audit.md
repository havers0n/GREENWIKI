# КОМПОНЕНТЫ БЛОКОВ - АНАЛИЗ РЕЕСТРА

## 📊 ОБЩАЯ СТАТИСТИКА

**Всего блоков:** 13  
**Контейнерных:** 1 (7.7%)  
**Атомарных:** 12 (92.3%)  
**Категорий:** 7  
**Блоков с слотами:** 1 (container_section)  

## 🏗️ СТРУКТУРА РЕЕСТРА

### Интерфейс BlockSpec
```typescript
interface BlockSpec<T = unknown> {
  type: string                    // Уникальный идентификатор
  name: string                    // Человекопонятное название
  defaultData: () => T           // Дефолтные данные
  Editor: React.FC               // Компонент редактора
  Renderer: React.LazyExoticComponent // Компонент отображения
  category: string               // Категория для группировки
  allowedChildren?: string[]     // Разрешенные дочерние блоки
  allowedSlots?: string[]        // Доступные слоты
}
```

## 📋 ИНВЕНТАРЬ БЛОКОВ

### Контейнерные блоки (1 шт)

| Тип | Название | Категория | Слоты | Дочерние блоки |
|-----|----------|-----------|-------|----------------|
| `container_section` | Контейнер (колонки) | Секции | `column1`, `column2`, `column3` | 11 типов блоков |

**Разрешенные дочерние блоки для container_section:**
- `button_group`, `categories_section`, `controls_section`
- `properties_section`, `animations_section`, `changelog_section`
- `heading`, `paragraph`, `single_image`, `single_button`, `spacer`

### Атомарные блоки (12 шт)

#### Навигация (1 шт)
| Тип | Название | Схема | Валидация |
|-----|----------|-------|-----------|
| `header` | Шапка | `{}` | ✅ Нет настраиваемых параметров |

#### Секции (1 шт)
| Тип | Название | Схема | Валидация |
|-----|----------|-------|-----------|
| `categories_section` | Сетка разделов форума | `{title, description}` | ✅ Полная |

#### UI компоненты (3 шт)
| Тип | Название | Схема | Валидация |
|-----|----------|-------|-----------|
| `controls_section` | Демо UI контролов | `{title}` | ✅ Полная |
| `button_group` | Группа кнопок | `{items[]}` | ✅ Полная |
| `single_button` | Кнопка | `{text, link, variant, size}` | ✅ Полная |

#### Контент (2 шт)
| Тип | Название | Схема | Валидация |
|-----|----------|-------|-----------|
| `heading` | Заголовок | `{text, level, align}` | ✅ Полная |
| `paragraph` | Параграф | `{text}` | ✅ Полная |

#### Медиа (1 шт)
| Тип | Название | Схема | Валидация |
|-----|----------|-------|-----------|
| `single_image` | Изображение | `{imageUrl, altText}` | ✅ Полная |

#### Данные (2 шт)
| Тип | Название | Схема | Валидация |
|-----|----------|-------|-----------|
| `properties_section` | Недвижимость | `{title, subtitle}` | ❌ Нет схемы |
| `animations_section` | Анимации | `{title, subtitle}` | ❌ Нет схемы |

#### Лэйаут (1 шт)
| Тип | Название | Схема | Валидация |
|-----|----------|-------|-----------|
| `spacer` | Отступ | `{height, customHeight?}` | ✅ Полная |

#### История изменений (1 шт)
| Тип | Название | Схема | Валидация |
|-----|----------|-------|-----------|
| `changelog_section` | История изменений | `{title}` | ✅ Полная |

## ⚠️ ВЫЯВЛЕННЫЕ ПРОБЛЕМЫ

### 1. **Отсутствие кнопки удаления в UI**

**Файл:** `frontend/src/widgets/ContextualInspector/index.tsx`
```typescript
// В ContextualInspector НЕТ кнопки удаления!
const ContextualInspector: React.FC<ContextualInspectorProps> = ({
  block,
  onBlockChange,
  // ❌ НЕТ onBlockDelete
}) => {
  // Только просмотр и редактирование контента
}
```

**Влияние:**
- Пользователи не могут удалять блоки
- Необходимость обходных решений

### 2. **Отсутствие селектора страниц**

**Файл:** `frontend/src/widgets/EditorToolbar/index.tsx`
```typescript
// В EditorToolbar НЕТ селектора страниц!
const EditorToolbar: React.FC<EditorToolbarProps> = ({
  pageIdentifier,  // Жестко задан
  // ❌ НЕТ pageSelector или списка страниц
}) => {
  // Только инструменты для текущей страницы
}
```

### 3. **Отсутствие визуализации глубины**

**Файл:** `frontend/src/widgets/BlockRenderer/ui/BlockRenderer.tsx`
```typescript
// НЕТ визуальной индикации вложенности
const BlockRenderer: React.FC<BlockRendererProps> = ({
  // ❌ НЕТ отображения уровня depth/indentation
}) => {
  return (
    <div className="space-y-12">
      {/* Все блоки на одном уровне визуально */}
    </div>
  )
}
```

### 4. **Проблемы с валидацией данных**

**Файлы:** `properties_section`, `animations_section`
```typescript
// НЕТ Zod схем для некоторых блоков
export const PropertiesSection: React.FC = () => {
  // ❌ Нет валидации входных данных
  return <div>Properties content</div>
}
```

## 🔍 АНАЛИЗ ИЕРАРХИИ

### Дерево вложенности:

```
container_section (макс. 3 слота)
├── column1
│   ├── heading
│   ├── paragraph
│   ├── single_image
│   ├── single_button
│   ├── button_group
│   ├── spacer
│   ├── categories_section
│   ├── controls_section
│   ├── properties_section
│   ├── animations_section
│   └── changelog_section
├── column2 (аналогично column1)
└── column3 (аналогично column1)
```

### Ограничения:
- ✅ Только `container_section` поддерживает вложенность
- ✅ Явные `allowedChildren` для контейнера
- ✅ Строгая типизация слотов (`column1`, `column2`, `column3`)

## 📊 МЕТРИКИ КАЧЕСТВА

| Аспект | Оценка | Комментарий |
|--------|--------|-------------|
| Полнота реестра | 100% | Все блоки зарегистрированы |
| Типизация | 95% | Отличная TypeScript поддержка |
| Валидация схем | 77% | 10/13 блоков имеют схемы |
| Иерархия | 85% | Хорошо продумана для контейнера |
| UI компоненты | 60% | Отсутствуют базовые функции |

## 🎯 РЕКОМЕНДАЦИИ ПО УЛУЧШЕНИЮ

### 1. Добавить кнопку удаления
```typescript
// В ContextualInspector/index.tsx
interface ContextualInspectorProps {
  // ДОБАВИТЬ:
  onBlockDelete?: (blockId: string) => Promise<void>
}

// ДОБАВИТЬ компонент:
const DeleteButton: React.FC<{ onDelete: () => void }> = ({ onDelete }) => (
  <Button variant="danger" onClick={onDelete}>
    🗑️ Удалить блок
  </Button>
)
```

### 2. Добавить селектор страниц
```typescript
// В EditorToolbar/index.tsx
interface EditorToolbarProps {
  // ДОБАВИТЬ:
  availablePages: Array<{ id: number; slug: string; title: string }>
  currentPage: { id: number; slug: string; title: string }
  onPageChange: (pageId: number) => void
}

// ДОБАВИТЬ компонент:
const PageSelector: React.FC<{...}> = ({ availablePages, currentPage, onPageChange }) => (
  <Select value={currentPage.id} onChange={(e) => onPageChange(Number(e.target.value))}>
    {availablePages.map(page => (
      <option key={page.id} value={page.id}>{page.title}</option>
    ))}
  </Select>
)
```

### 3. Добавить визуализацию глубины
```typescript
// В BlockRenderer/ui/BlockRenderer.tsx
const BlockWrapper: React.FC<{ depth: number; children: React.ReactNode }> = ({ depth, children }) => {
  const indentClass = depth > 0 ? `ml-${depth * 4}` : ''
  const borderClass = depth > 0 ? 'border-l-2 border-gray-300 pl-4' : ''

  return (
    <div className={`${indentClass} ${borderClass}`}>
      {depth > 0 && (
        <div className="text-xs text-gray-400 mb-1">
          {'  '.repeat(depth)}└─ вложенный блок
        </div>
      )}
      {children}
    </div>
  )
}
```

### 4. Добавить недостающие схемы
```typescript
// Для properties_section и animations_section
const PropertiesSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен'),
  subtitle: z.string().default('')
})
```

## 📁 ФАЙЛОВАЯ СТРУКТУРА

```
frontend/src/widgets/
├── AtomicBlocks/           # 12 атомарных блоков
│   ├── HeadingBlock/
│   ├── ParagraphBlock/
│   ├── ImageBlock/
│   ├── ButtonBlock/
│   └── SpacerBlock/
├── BlockRenderer/          # Рендерер с поддержкой вложенности
├── ContextualInspector/    # ❌ ПРОБЛЕМА: нет кнопки удаления
├── EditorManager/          # Обертка над редактором
├── EditorToolbar/          # ❌ ПРОБЛЕМА: нет селектора страниц
├── NewLiveEditor/          # Основной редактор
└── shared/config/
    └── blockRegistry.tsx   # ✅ Центральный реестр блоков
```

## 🔗 СВЯЗИ С ДРУГИМИ КОМПОНЕНТАМИ

- **API:** Все блоки используют типы из `@my-forum/db-types`
- **Редактор:** `NewLiveEditor` использует реестр для создания/редактирования
- **Отображение:** `BlockRenderer` использует реестр для рендеринга
- **Валидация:** Zod схемы интегрированы в редакторы

---

*Анализ основан на статическом разборе реестра блоков и компонентов*
