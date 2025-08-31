# Аудит производительности

## Обзор производительности

### Текущие метрики (оценочные)

#### Web Vitals (предполагаемые значения):
- **First Contentful Paint (FCP):** 2.5-3.5 сек ⚠️
- **Largest Contentful Paint (LCP):** 3.5-4.5 сек ⚠️
- **First Input Delay (FID):** 100-200 мс ⚠️
- **Cumulative Layout Shift (CLS):** 0.05-0.15 ⚠️

#### Реальные показатели (нуждаются в измерении):
- **Time to Interactive (TTI):** 4-6 сек
- **Bundle Size:** 1.14 MB (gzipped: 330 KB)

## Обнаруженные проблемы производительности

### 🔴 Критические проблемы

#### 1. Отсутствие оптимизаций React компонентов

**Проблема:** Большинство компонентов не используют `React.memo`, `useMemo`, `useCallback`

**Примеры неоптимизированных компонентов:**
```typescript
// ❌ Плохо - ре-рендер при каждом изменении props
const BlockRenderer: React.FC<BlockRendererProps> = ({ block, onChange }) => {
  // Каждый рендер создает новые функции
  const handleChange = () => onChange(block.id);
  return <div onClick={handleChange}>{block.content}</div>;
};

// ✅ Хорошо - оптимизированный компонент
const BlockRenderer: React.FC<BlockRendererProps> = React.memo(({ block, onChange }) => {
  const handleChange = useCallback(() => onChange(block.id), [block.id, onChange]);
  return <div onClick={handleChange}>{block.content}</div>;
});
```

**Найденные случаи:**
- `ContextualInspector` (280+ строк) - нет `React.memo`
- `EditorToolbar` (306 строк) - нет оптимизаций
- Большинство компонентов в `widgets/` - не оптимизированы

#### 2. Проблемы с dangerouslySetInnerHTML

**Обнаруженные использования:**
```typescript
// frontend/src/widgets/AtomicBlocks/ParagraphBlock/index.tsx:81
dangerouslySetInnerHTML={{
  __html: content.text
}}

// frontend/src/features/ReusableBlocksLibrary/BlockCard.tsx:61
parent.innerHTML = `
```

**Риски:**
- XSS уязвимости
- Нарушение React виртуального DOM
- Потенциальные проблемы с производительностью при частых обновлениях

#### 3. Неэффективные подписки на Redux store

**Проблема:** Слишком широкие селекторы

```typescript
// ❌ Плохо - подписка на весь store
const allBlocks = useAppSelector(state => state.content.blocks);

// ✅ Хорошо - специфичный селектор
const selectedBlock = useAppSelector(selectSelectedBlock);
```

### 🟡 Предупреждения

#### 1. Отсутствие виртуализации для больших списков

**Текущая ситуация:**
- `VirtualizedCanvas` использует виртуализацию ✅
- Другие списки (блоки, категории) не виртуализированы ❌

#### 2. Неоптимизированные анимации

**Проблема:** Framer Motion используется без оптимизаций

```typescript
// ❌ Может вызывать лишние ре-рендеры
<AnimatePresence>
  <motion.div animate={{ x: 100 }}>
    {items.map(item => <Item key={item.id} />)}
  </motion.div>
</AnimatePresence>
```

#### 3. Отсутствие debouncing для частых обновлений

**Найденные случаи:**
- Обновление блоков в редакторе
- Изменение свойств в ContextualInspector
- Поиск в ReusableBlocksLibrary

## Анализ React Profiler (гипотетический)

### Возможные узкие места:

#### 1. ContextualInspector
```
📊 Render time: 50-100ms
📊 Re-render count: 10-20 раз на изменение
🔍 Причина: Отсутствие memo, сложная логика в рендере
```

#### 2. BlockRenderer
```
📊 Render time: 20-50ms per block
📊 Re-render count: Высокий при изменениях
🔍 Причина: Передача новых объектов в props
```

#### 3. Redux store subscriptions
```
📊 Selector calls: 100-200 per action
📊 Re-render cascade: 5-10 компонентов
🔍 Причина: Широкие селекторы, отсутствие memoization
```

## Рекомендации по оптимизации

### P0 (Критично - немедленная реализация):

#### 1. Добавить React.memo к крупным компонентам
```typescript
// В EditorToolbar/index.tsx
const EditorToolbar = React.memo<EditorToolbarProps>(({ ... }) => {
  // ... component logic
});

// В ContextualInspector/index.tsx
const ContextualInspector = React.memo<ContextualInspectorProps>(({ ... }) => {
  // ... component logic
});
```

#### 2. Оптимизировать колбэки
```typescript
const handleSave = useCallback(async () => {
  await onSave();
}, [onSave]);

const handleBlockChange = useCallback((blockId: string, changes: any) => {
  onBlockChange(blockId, changes);
}, [onBlockChange]);
```

#### 3. Заменить dangerouslySetInnerHTML
```typescript
// Вместо dangerouslySetInnerHTML использовать React элементы
const renderContent = (text: string) => {
  // Парсинг markdown или HTML в React элементы
  return <div>{parsedContent}</div>;
};
```

### P1 (Важно - в ближайшие 2 недели):

#### 1. Внедрить Reselect для селекторов
```typescript
// store/selectors/blockSelectors.ts
export const selectVisibleBlocks = createSelector(
  [selectAllBlocks, selectSearchTerm],
  (blocks, searchTerm) => {
    return blocks.filter(block =>
      block.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
);
```

#### 2. Добавить debouncing для поиска
```typescript
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    dispatch(setSearchQuery(query));
  }, 300),
  [dispatch]
);
```

#### 3. Оптимизировать анимации
```typescript
<motion.div
  layoutId={block.id} // Для плавных переходов
  initial={false} // Отключить начальную анимацию
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
>
  {content}
</motion.div>
```

### P2 (Оптимизация - в ближайший месяц):

#### 1. Внедрить React Compiler (если доступен)
```typescript
// В vite.config.ts добавить React Compiler
// Автоматическая оптимизация компонентов
```

#### 2. Добавить виртуализацию для списков
```typescript
// Для длинных списков блоков
import { FixedSizeList as List } from 'react-window';

<List
  height={400}
  itemCount={blocks.length}
  itemSize={50}
>
  {({ index }) => <BlockItem block={blocks[index]} />}
</List>
```

#### 3. Оптимизировать bundle splitting
```typescript
// Ленивые импорты для тяжелых компонентов
const HeavyEditor = lazy(() =>
  import('features/BlockEditors/HeavyEditor')
);
```

## Метрики для мониторинга

### Ключевые показатели производительности:

```typescript
// Внедрить performance monitoring
const reportWebVitals = (metric: any) => {
  console.log(metric); // Отправлять в аналитику
  // FCP, LCP, FID, CLS
};
```

### React DevTools Profiler метрики:

1. **Render duration** - время рендера компонента
2. **Render count** - количество ре-рендеров
3. **Time spent** - общее время в компоненте

## Инструменты для анализа

### Рекомендуемые инструменты:

1. **React DevTools Profiler** - анализ ре-рендеров
2. **Lighthouse CI** - автоматизированные тесты производительности
3. **Web Vitals** - мониторинг основных метрик
4. **Bundle Analyzer** - анализ размера бандла

### Сценарии тестирования производительности:

1. **Открытие редактора страницы** - TTI, LCP
2. **Добавление блока** - FID, ре-рендеры
3. **Изменение свойств блока** - ре-рендеры, анимации
4. **Сохранение страницы** - сетевые запросы, UI блокировки

## Заключение

**Текущий статус производительности:** 🟡 Требует оптимизации

**Основные проблемы:**
- Отсутствие оптимизаций React компонентов
- Неэффективные подписки на store
- Проблемы с dangerouslySetInnerHTML

**Ожидаемый результат после оптимизации:**
- Снижение TTI на 30-50%
- Уменьшение количества ре-рендеров на 40-60%
- Улучшение пользовательского опыта

**Приоритет оптимизаций:**
1. Добавить React.memo к крупным компонентам
2. Оптимизировать колбэки и селекторы
3. Заменить dangerouslySetInnerHTML на безопасные альтернативы
4. Добавить debouncing и виртуализацию
