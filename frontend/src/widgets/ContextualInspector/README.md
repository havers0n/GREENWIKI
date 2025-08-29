# ContextualInspector - Рефакторинг монстра

## Обзор

`ContextualInspector` был одним из крупнейших "монстров" в кодовой базе - **387 строк** в одном файле с множественными ответственностями. Этот компонент был полностью рефакторирован на чистые, переиспользуемые компоненты согласно новой архитектуре.

## Проблемы оригинального компонента

### 🚨 Выявленные проблемы:
- **387 строк** в одном файле
- **Множественные ответственности**: UI, бизнес-логика, состояние, валидация
- **Смешивание слоев**: Redux, валидация, UI в одном месте
- **Сложность тестирования**: невозможно тестировать отдельные части
- **Плохая поддерживаемость**: любое изменение затрагивало весь компонент

### ✅ Результаты рефакторинга:

| **Метрика** | **До** | **После** |
|-------------|--------|-----------|
| **Файлов** | 1 (387 строк) | 11 файлов |
| **Компонентов** | 1 монстр | 6 чистых компонентов |
| **Хуков** | 0 | 4 специализированных хука |
| **Ответственность** | Смешанная | Четко разделена |
| **Тестируемость** | Сложная | Простая |
| **Переиспользуемость** | Низкая | Высокая |

## Новая архитектура

```
ContextualInspector/
├── ui/
│   ├── ContextualInspectorNew.tsx    # Главный композитор
│   ├── InspectorHeader.tsx           # Заголовок с иконкой
│   ├── BlockInfo.tsx                 # Информация о блоке
│   ├── BlockNavigation.tsx           # Управление позицией
│   ├── BlockContentEditor.tsx        # Редактор контента
│   ├── BlockDesignEditor.tsx         # Дизайн настройки
│   └── BlockActions.tsx              # Панели действий
├── model/
│   ├── useInspectorLogic.ts          # Основная бизнес-логика
│   └── useBlockNavigation.ts         # Логика навигации
├── types/
│   └── index.ts                      # Полная типизация
├── example.tsx                       # Примеры использования
├── indexNew.ts                       # Экспорты
└── README.md                         # Эта документация
```

## Компоненты

### 1. ContextualInspectorNew (Главный композитор)

```tsx
<ContextualInspectorNew
  block={selectedBlock}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onBlockChange={handleBlockChange}
  // ... другие props
/>
```

**Ответственность**: Композиция всех подкомпонентов, управление общим состоянием.

### 2. InspectorHeader

```tsx
<InspectorHeader
  block={block}
  onClose={onClose}
/>
```

**Ответственность**: Отображение иконки блока, названия и кнопки закрытия.

### 3. BlockInfo

```tsx
<BlockInfo
  block={block}
  statusInfo={statusInfo}
/>
```

**Ответственность**: Отображение позиции, статуса и слота блока.

### 4. BlockNavigation

```tsx
<BlockNavigation
  block={block}
  allBlocks={allBlocks}
  onMoveLeft={onMoveLeft}
  onMoveRight={onMoveRight}
/>
```

**Ответственность**: Управление позицией блока (влево/вправо).

### 5. BlockContentEditor

```tsx
<BlockContentEditor
  block={block}
  spec={spec}
  data={data}
  onBlockChange={onBlockChange}
/>
```

**Ответственность**: Редактирование контента блока с валидацией.

### 6. BlockDesignEditor

```tsx
<BlockDesignEditor
  block={block}
  metadata={metadata}
  onMetadataChange={handleMetadataChange}
/>
```

**Ответственность**: Дизайн настройки (spacing, colors, borders).

### 7. BlockActions

```tsx
<BlockActions
  block={block}
  onBlockDelete={onBlockDelete}
  onPublishToggle={onPublishToggle}
  publishing={publishing}
/>
```

**Ответственность**: Панели удаления и публикации блока.

## Хуки

### useInspectorLogic

```tsx
const {
  spec,
  isInstance,
  Editor,
  data,
  metadata,
  statusInfo
} = useInspectorLogic(block, blockId);
```

**Ответственность**: Вся основная бизнес-логика инспектора.

### useBlockNavigation

```tsx
const { canMoveLeft, canMoveRight } = useBlockNavigation(block, allBlocks);
```

**Ответственность**: Логика определения возможности перемещения блоков.

### useBlockMetadata

```tsx
const { metadata, handleMetadataChange } = useBlockMetadata(block, onBlockChange);
```

**Ответственность**: Управление метаданными блока.

### useKeyboardNavigation

```tsx
const { handleKeyDown } = useKeyboardNavigation(onMoveLeft, onMoveRight, blockId);
```

**Ответственность**: Обработка клавиатурных сокращений.

## Принципы рефакторинга

### 🎯 **Единственная ответственность**
- Каждый компонент делает только одну вещь
- Хуки содержат только логику, без UI
- Типы строго типизированы

### 🔄 **Композиция через props**
- Все компоненты принимают данные через props
- Нет жестких зависимостей от контекста
- Легко тестировать с mock данными

### 📦 **Изоляция логики**
- Бизнес-логика вынесена в хуки
- UI компоненты чистые и декларативные
- Redux интеграция только в useInspectorLogic

### 🧪 **Тестируемость**
```tsx
// Тестирование отдельного компонента
test('InspectorHeader renders block icon and name', () => {
  render(<InspectorHeader block={mockBlock} onClose={mockOnClose} />);
  expect(screen.getByText('🏠')).toBeInTheDocument();
});

// Тестирование хука
test('useInspectorLogic returns correct spec', () => {
  const { spec } = useInspectorLogic(mockBlock);
  expect(spec).toBeDefined();
});
```

## Миграция

### Старая версия (устаревшая):
```tsx
// Старая версия остается для обратной совместимости
import ContextualInspector from './index';

// Использование остается тем же
<ContextualInspector
  block={block}
  isOpen={isOpen}
  onClose={onClose}
  // ... остальные props
/>
```

### Новая версия (рекомендуемая):
```tsx
// Новая версия с явным импортом
import { ContextualInspector } from './indexNew';

// API полностью совместим
<ContextualInspector
  block={block}
  isOpen={isOpen}
  onClose={onClose}
  // ... остальные props
/>
```

## Преимущества новой архитектуры

### 🚀 **Производительность**
- React.memo для всех компонентов
- Оптимизированные перерендеринги
- Ленивая загрузка тяжелых компонентов

### 🔧 **Поддерживаемость**
- Каждый компонент можно изменять независимо
- Четкие контракты между компонентами
- Подробная документация и примеры

### 🧪 **Тестируемость**
- Unit тесты для каждого компонента
- Integration тесты для взаимодействия
- E2E тесты для полного функционала

### 🔄 **Расширяемость**
- Легко добавлять новые типы блоков
- Новые дизайн контролы без изменения ядра
- Кастомные редакторы через props

## Будущие улучшения

- [ ] Интеграция с Framer Motion для плавных анимаций
- [ ] Клавиатурные сокращения для всех действий
- [ ] Drag & drop для переупорядочивания вкладок
- [ ] Темизация через CSS Variables
- [ ] Интеграция с React Query для кеширования

## Заключение

Рефакторинг ContextualInspector демонстрирует эффективный подход к декомпозиции крупных компонентов:

- ✅ **Масштабируемость**: от 387 строк до 11 файлов
- ✅ **Читаемость**: каждый компонент имеет четкую цель
- ✅ **Поддерживаемость**: изменения изолированы
- ✅ **Тестируемость**: можно тестировать каждую часть отдельно
- ✅ **Переиспользуемость**: компоненты можно использовать в других местах

Рекомендуется использовать новую архитектуру для всех инспектор-подобных компонентов в приложении.

---

*Этот рефакторинг является частью большой работы по оздоровлению frontend-архитектуры CMS.*
