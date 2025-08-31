# Аудит доступности (A11Y)

## Обзор доступности

### Текущий статус доступности: 🟡 Требует улучшений

**Обнаруженные проблемы:**
- Отсутствие семантических ролей для интерактивных элементов
- Недостаточная поддержка клавиатурной навигации
- Проблемы с контрастом текста
- Отсутствие альтернативных текстов для изображений
- Неправильная структура заголовков

## Детальный анализ проблем

### 🔴 Критические проблемы

#### 1. Отсутствие ARIA labels для интерактивных элементов

**Найденные проблемы:**

```typescript
// ❌ Проблема - кнопки без aria-label
<button className="text-majestic-gray-300 group-hover:text-majestic-pink">
  <Icon />
</button>

// ✅ Решение - добавить aria-label
<button
  className="text-majestic-gray-300 group-hover:text-majestic-pink"
  aria-label="Добавить категорию"
>
  <Icon />
</button>
```

**Где найдено:**
- `entities/category/ui/CategoryCard.tsx:22` - кнопка без описания
- `entities/property/ui/PropertyCard.tsx:31` - кнопка без описания
- Множество кнопок в `EditorToolbar` без aria-label

#### 2. Проблемы с focus management

**Найденные проблемы:**

```typescript
// ❌ Проблема - элементы не доступны с клавиатуры
<div
  className="cursor-move focus-ring"
  onClick={handleClick}
  tabIndex={0} // ✅ Хорошо, что есть tabIndex
>
// Но отсутствует keyboard event handler!
```

**Требуется добавить:**
```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleClick();
  }
};

<div
  className="cursor-move focus:ring-2 focus:ring-blue-500"
  onClick={handleClick}
  onKeyDown={handleKeyDown}
  tabIndex={0}
  role="button"
  aria-label="Выбрать блок"
>
```

#### 3. Проблемы с контрастом

**Найденные проблемы с цветами:**

```typescript
// ❌ Проблема - низкий контраст
<span className="text-gray-500 dark:text-gray-400">
// Контраст gray-500 на светлом фоне может быть недостаточным

// ✅ Решение - улучшить контраст
<span className="text-gray-700 dark:text-gray-300">
```

**Проблемные места:**
- `widgets/ContextualInspector/index.tsx:89` - `text-gray-500`
- `widgets/ContextualInspector/index.tsx:171` - `text-gray-500`
- Множество мест с `text-gray-400` на светлом фоне

### 🟡 Предупреждения

#### 1. Отсутствие альтернативных текстов для изображений

**Найденные проблемы:**

```typescript
// ❌ Проблема - изображения без alt текста
<img src={imageUrl} />

// ✅ Решение - добавить alt
<img
  src={imageUrl}
  alt={altText || "Изображение блока"}
/>
```

**Где найдено:**
- `widgets/AtomicBlocks/ImageBlock/index.tsx` - требует проверки alt атрибутов

#### 2. Неправильная структура заголовков

**Найденные проблемы:**

```typescript
// ❌ Проблема - несогласованная иерархия заголовков
<h1>Главная страница</h1>
  <h2>Раздел 1</h2>
    <h1>Подраздел</h1> // ❌ Нарушение иерархии!

// ✅ Решение - правильная иерархия
<h1>Главная страница</h1>
  <h2>Раздел 1</h2>
    <h3>Подраздел</h3> // ✅ Правильная иерархия
```

#### 3. Отсутствие ролей для сложных компонентов

**Найденные проблемы:**

```typescript
// ❌ Проблема - нет роли для навигации
<nav className="flex space-x-1" aria-label="Вкладки">
// Хорошо, что есть aria-label, но нужна роль

// ✅ Решение - добавить роль
<nav
  className="flex space-x-1"
  role="tablist"
  aria-label="Вкладки"
>
```

### 🟢 Положительные аспекты

#### Хорошо реализованная доступность:

```typescript
// ✅ Хорошо - правильное использование ARIA
<nav className="flex space-x-1" aria-label="Вкладки">

// ✅ Хорошо - правильное использование role="alert"
<p className="text-sm text-red-600" role="alert">

// ✅ Хорошо - описательные aria-label
aria-label="Применить шаблон"
aria-label="Удалить шаблон"
aria-label={`Дроп-зона для слота ${slotName}`}
```

## Рекомендации по исправлению

### P0 (Критично - немедленная реализация):

#### 1. Добавить ARIA labels ко всем интерактивным элементам

```typescript
// В CategoryCard.tsx
<button
  aria-label={`Открыть категорию ${title}`}
  onClick={() => onCategoryClick(id)}
>
  <Icon />
</button>

// В PropertyCard.tsx
<button
  aria-label={`Редактировать свойство ${property.name}`}
  onClick={() => onEdit(property.id)}
>
  <EditIcon />
</button>
```

#### 2. Исправить контраст текста

```typescript
// Заменить низкоконтрастные цвета
text-gray-500 → text-gray-700
text-gray-400 → text-gray-600

// В темной теме
dark:text-gray-400 → dark:text-gray-200
```

#### 3. Добавить keyboard navigation

```typescript
// В RenderBlockNode.tsx
const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault();
      onBlockClick(block);
      break;
    case 'Delete':
      e.preventDefault();
      onBlockDelete(block.id);
      break;
  }
}, [block, onBlockClick, onBlockDelete]);

<div
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
  aria-label={`Блок ${block.block_type}`}
>
```

### P1 (Важно - в ближайшие 2 недели):

#### 1. Добавить альтернативные тексты

```typescript
// В ImageBlock
<img
  src={imageUrl}
  alt={altText || `Изображение блока ${blockId}`}
  loading="lazy"
/>
```

#### 2. Исправить структуру заголовков

```typescript
// В AdminEditorPage
<h1>Редактор страницы</h1>
  <h2>Панель инструментов</h2>
  <h2>Область редактирования</h2>
    <h3>Блок контента</h3>
```

#### 3. Добавить skip links

```typescript
// В AdminLayout
<nav aria-label="Пропустить навигацию">
  <a href="#main-content" className="skip-link">
    Перейти к основному содержимому
  </a>
</nav>
```

### P2 (Оптимизация - в ближайший месяц):

#### 1. Добавить live regions для уведомлений

```typescript
// В NotificationContext
<div
  aria-live="polite"
  aria-atomic="true"
  role="status"
>
  {notifications.map(notification => (
    <Notification key={notification.id} {...notification} />
  ))}
</div>
```

#### 2. Улучшить focus indicators

```typescript
// Добавить видимые индикаторы фокуса
.focus-visible {
  @apply ring-2 ring-blue-500 ring-offset-2;
}

// Использовать в компонентах
<button className="focus-visible">
```

#### 3. Добавить screen reader контекст

```typescript
// Для сложных компонентов
<div aria-describedby="inspector-description">
  <div id="inspector-description" className="sr-only">
    Панель свойств блока. Используйте Tab для навигации по элементам управления.
  </div>
  {/* Содержимое инспектора */}
</div>
```

## Метрики доступности

### Целевые показатели (WCAG 2.1 AA):

- **Contrast ratio:** Минимум 4.5:1 для обычного текста, 3:1 для крупного
- **Keyboard navigation:** Все интерактивные элементы доступны с клавиатуры
- **Screen reader support:** Минимум 95% контента доступно для скринридеров
- **Focus management:** Видимые индикаторы фокуса, логичная последовательность

### Текущие показатели (оценочные):

- **Contrast ratio:** 60% соответствуют требованиям
- **Keyboard navigation:** 40% элементов поддерживают клавиатуру
- **ARIA labels:** 30% интерактивных элементов имеют правильные labels
- **Semantic HTML:** 50% структуры соответствует стандартам

## Инструменты для проверки

### Рекомендуемые инструменты:

1. **Lighthouse Accessibility Audit**
2. **axe DevTools**
3. **NVDA Screen Reader** (для Windows)
4. **VoiceOver** (для macOS)
5. **WAVE Web Accessibility Tool**

### Автоматизированные тесты:

```typescript
// Внедрить в CI/CD
import { axe } from 'jest-axe';

describe('Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Component />);
    const results = await axe(container);
    expect(results.violations).toHaveLength(0);
  });
});
```

## Заключение

**Текущий уровень доступности:** 🟡 Требует значительных улучшений

**Основные проблемы:**
- Отсутствие ARIA labels для большинства интерактивных элементов
- Проблемы с контрастом текста
- Недостаточная поддержка клавиатурной навигации

**Рекомендуемый план действий:**
1. **Неделя 1:** Добавить ARIA labels и исправить контраст
2. **Неделя 2:** Реализовать клавиатурную навигацию
3. **Месяц 1:** Добавить screen reader поддержку и live regions

**Ожидаемый результат:**
- Достижение WCAG 2.1 AA compliance
- Улучшение пользовательского опыта для людей с disabilities
- Снижение потенциальных юридических рисков
