# 03. Core Block Library Specification

## Цель документа
Определить спецификации для чистой, атомарной библиотеки базовых блоков, которая станет фундаментом для всей CMS после рефакторинга. Каждый блок должен быть независимым, переиспользуемым и готовым к Drag & Drop.

## Архитектурные принципы базовых блоков

### 🎯 Core Principles:
1. **Composition over Configuration**: Все блоки принимают `children` через props
2. **Single Responsibility**: Каждый блок делает только одну вещь хорошо
3. **D&D Ready**: Все блоки совместимы с drag & drop из коробки
4. **Type Safety**: Полная TypeScript типизация
5. **Accessibility**: WCAG 2.1 AA compliance
6. **Performance**: Оптимизированы для перерендеринга

### 🔧 Technical Requirements:
- React 18+ с хуками
- TypeScript 5.0+
- Tailwind CSS для стилизации
- @dnd-kit для drag & drop
- Framer Motion для анимаций

## Спецификации базовых блоков

### 1. Container Block
**Название**: Container
**Назначение**: Основной блок для группировки и структурирования контента. Универсальный контейнер, который может работать как flexbox, grid или обычный блок.

**Ключевые Props**:
```typescript
interface ContainerProps {
  // Контент
  children: React.ReactNode;

  // Layout
  layout?: 'flex' | 'grid' | 'block';
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';

  // Grid-specific (when layout='grid')
  columns?: number | string;
  rows?: number | string;
  gap?: number;

  // Spacing
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
  margin?: number | { top?: number; right?: number; bottom?: number; left?: number };

  // Styling
  backgroundColor?: string;
  borderRadius?: number;
  border?: {
    width?: number;
    style?: 'solid' | 'dashed' | 'dotted';
    color?: string;
  };
  boxShadow?: string;

  // D&D
  droppableId?: string;
  isDropDisabled?: boolean;

  // CMS-specific
  blockId?: string;
  className?: string;
}
```

**Поведение**:
- ✅ **D&D Ready**: Автоматически становится droppable зоной
- ✅ **Responsive**: Адаптивное поведение на всех экранах
- ✅ **Performance**: Использует React.memo для предотвращения лишних перерендерингов
- ✅ **Composition**: Принимает любые дочерние элементы

**Примеры использования**:
```tsx
// Простой контейнер
<Container padding={16} backgroundColor="#f5f5f5">
  <Heading level={2}>Заголовок</Heading>
  <Paragraph>Текст параграфа</Paragraph>
</Container>

// Flexbox контейнер
<Container
  layout="flex"
  direction="row"
  justify="between"
  align="center"
  gap={16}
>
  <Button>Кнопка 1</Button>
  <Button>Кнопка 2</Button>
</Container>

// Grid контейнер
<Container
  layout="grid"
  columns={3}
  gap={24}
  padding={32}
>
  <Card>Карточка 1</Card>
  <Card>Карточка 2</Card>
  <Card>Карточка 3</Card>
</Container>
```

---

### 2. Section Block
**Название**: Section
**Назначение**: Семантическая секция для группировки связанных элементов контента. Автоматически добавляет отступы и может иметь максимальную ширину.

**Ключевые Props**:
```typescript
interface SectionProps {
  children: React.ReactNode;

  // Layout
  maxWidth?: number | 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fullWidth?: boolean;

  // Spacing
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
  margin?: number | { top?: number; right?: number; bottom?: number; left?: number };

  // Styling
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundPosition?: string;

  // D&D
  droppableId?: string;
  isDropDisabled?: boolean;

  // CMS-specific
  blockId?: string;
  className?: string;
}
```

**Поведение**:
- ✅ **Semantic**: Использует `<section>` элемент
- ✅ **Responsive**: Максимальная ширина адаптируется под экран
- ✅ **Background**: Поддержка фоновых изображений и цветов
- ✅ **Auto-spacing**: Интеллектуальные отступы

**Примеры использования**:
```tsx
// Основная секция
<Section maxWidth="lg" padding={{ top: 64, bottom: 64 }}>
  <Container layout="flex" direction="column" gap={32}>
    <Heading level={1}>Главная секция</Heading>
    <Paragraph>Описание секции</Paragraph>
  </Container>
</Section>

// Hero секция
<Section
  fullWidth
  backgroundImage="/hero-bg.jpg"
  backgroundSize="cover"
  padding={{ top: 120, bottom: 120 }}
>
  <Container layout="flex" direction="column" align="center" gap={24}>
    <Heading level={1} color="white">Hero заголовок</Heading>
    <Button size="lg">Call to action</Button>
  </Container>
</Section>
```

---

### 3. Column Block
**Название**: Column
**Назначение**: Гибкая колонка для создания сеток и многоколоночных макетов. Работает внутри Container с layout="grid".

**Ключевые Props**:
```typescript
interface ColumnProps {
  children: React.ReactNode;

  // Grid positioning
  span?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  start?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  end?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };

  // Spacing
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
  gap?: number;

  // D&D
  droppableId?: string;
  isDropDisabled?: boolean;

  // CMS-specific
  blockId?: string;
  className?: string;
}
```

**Поведение**:
- ✅ **CSS Grid**: Использует CSS Grid для точного позиционирования
- ✅ **Responsive**: Адаптивные breakpoints для разных экранов
- ✅ **Auto-placement**: Автоматическое размещение в сетке
- ✅ **Nested**: Поддержка вложенных колонок

**Примеры использования**:
```tsx
<Container layout="grid" columns={12} gap={24}>
  {/* Полная ширина на мобильных, половина на десктопе */}
  <Column span={{ xs: 12, md: 6 }}>
    <Card>Карточка 1</Card>
  </Column>

  {/* Одна треть на всех экранах */}
  <Column span={4}>
    <Card>Карточка 2</Card>
  </Column>

  {/* Две трети на всех экранах */}
  <Column span={8}>
    <Card>Карточка 3</Card>
  </Column>
</Container>
```

---

### 4. Button Block
**Название**: Button
**Назначение**: Универсальный интерактивный элемент для действий пользователя. Очищенная версия без дублированной логики.

**Ключевые Props**:
```typescript
interface ButtonProps {
  children: React.ReactNode;

  // Variants
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  // States
  disabled?: boolean;
  loading?: boolean;

  // Actions
  onClick?: (event: React.MouseEvent) => void;
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';

  // Styling
  fullWidth?: boolean;
  className?: string;

  // Icons
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  // CMS-specific
  blockId?: string;
}
```

**Поведение**:
- ✅ **Accessibility**: Правильные ARIA атрибуты и keyboard navigation
- ✅ **Loading states**: Встроенная поддержка состояния загрузки
- ✅ **Link support**: Может работать как ссылка или кнопка
- ✅ **Icon support**: Поддержка иконок слева и справа
- ✅ **Type safety**: Строгая типизация всех props

**Примеры использования**:
```tsx
// Простая кнопка
<Button onClick={handleClick}>Нажми меня</Button>

// Кнопка с иконкой
<Button
  variant="primary"
  size="lg"
  leftIcon={<Icon name="plus" />}
  onClick={handleAdd}
>
  Добавить элемент
</Button>

// Кнопка-ссылка
<Button
  variant="ghost"
  href="/dashboard"
  rightIcon={<Icon name="arrow-right" />}
>
  Перейти в дашборд
</Button>

// Loading состояние
<Button
  loading={isLoading}
  disabled={isLoading}
  onClick={handleSubmit}
>
  {isLoading ? 'Сохранение...' : 'Сохранить'}
</Button>
```

---

### 5. Heading Block
**Название**: Heading
**Назначение**: Семантический заголовок с правильной иерархией и стилизацией.

**Ключевые Props**:
```typescript
interface HeadingProps {
  children: React.ReactNode;
  level: 1 | 2 | 3 | 4 | 5 | 6;

  // Styling
  color?: string;
  fontSize?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  fontWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  textAlign?: 'left' | 'center' | 'right' | 'justify';

  // Spacing
  margin?: number | { top?: number; bottom?: number };

  // CMS-specific
  blockId?: string;
  className?: string;
}
```

**Поведение**:
- ✅ **Semantic**: Использует правильные `<h1>`-`<h6>` теги
- ✅ **SEO-friendly**: Правильная иерархия заголовков
- ✅ **Typography scale**: Последовательная шкала размеров
- ✅ **Responsive**: Адаптивные размеры текста

**Примеры использования**:
```tsx
<Heading level={1} fontSize="3xl" textAlign="center">
  Главный заголовок страницы
</Heading>

<Heading level={2} color="#374151" fontWeight="semibold">
  Раздел сайта
</Heading>

<Heading level={3} margin={{ bottom: 16 }}>
  Подраздел
</Heading>
```

---

### 6. Paragraph Block
**Название**: Paragraph
**Назначение**: Текстовый блок с поддержкой rich text и правильной типографикой.

**Ключевые Props**:
```typescript
interface ParagraphProps {
  children: React.ReactNode;

  // Text styling
  fontSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fontWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: 'tight' | 'normal' | 'relaxed' | 'loose';

  // Rich text support
  richText?: boolean;
  content?: string; // HTML или Markdown

  // Spacing
  margin?: number | { top?: number; bottom?: number };

  // CMS-specific
  blockId?: string;
  className?: string;
}
```

**Поведение**:
- ✅ **Rich text**: Поддержка форматированного текста
- ✅ **Typography**: Правильные межстрочные интервалы
- ✅ **Responsive**: Адаптивная типографика
- ✅ **Accessibility**: Высокий контраст и читаемость

**Примеры использования**:
```tsx
// Простой параграф
<Paragraph fontSize="md" lineHeight="relaxed">
  Это обычный текстовый параграф с правильной типографикой.
</Paragraph>

// Rich text параграф
<Paragraph
  richText
  content="<strong>Жирный текст</strong> и <em>курсив</em>"
  textAlign="justify"
/>

// Маленький параграф
<Paragraph fontSize="sm" color="#6b7280">
  Вспомогательный текст
</Paragraph>
```

---

### 7. Image Block
**Название**: Image
**Назначение**: Оптимизированный блок для отображения изображений с ленивой загрузкой и адаптивностью.

**Ключевые Props**:
```typescript
interface ImageProps {
  src: string;
  alt: string;

  // Sizing
  width?: number | string;
  height?: number | string;
  aspectRatio?: number | string;

  // Object fit
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;

  // Loading
  loading?: 'lazy' | 'eager';
  placeholder?: string;

  // Effects
  blur?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;

  // CMS-specific
  blockId?: string;
  className?: string;
}
```

**Поведение**:
- ✅ **Performance**: Ленивая загрузка и оптимизация
- ✅ **Responsive**: Адаптивные размеры
- ✅ **Accessibility**: Правильные alt-тексты
- ✅ **Error handling**: Graceful fallback для сломанных изображений

**Примеры использования**:
```tsx
// Основное изображение
<Image
  src="/hero-image.jpg"
  alt="Главное изображение страницы"
  width="100%"
  height={400}
  objectFit="cover"
/>

// Аватар
<Image
  src="/avatar.jpg"
  alt="Фото пользователя"
  width={64}
  height={64}
  objectFit="cover"
  className="rounded-full"
/>

// С эффектами
<Image
  src="/photo.jpg"
  alt="Фотография"
  blur={2}
  brightness={1.1}
  objectFit="cover"
/>
```

---

### 8. Spacer Block
**Название**: Spacer
**Назначение**: Невидимый блок для создания отступов между элементами. Заменяет множественные margin/padding правила.

**Ключевые Props**:
```typescript
interface SpacerProps {
  // Size
  size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

  // Axis (for flexbox/grid layouts)
  axis?: 'horizontal' | 'vertical' | 'both';

  // CMS-specific
  blockId?: string;
  className?: string;
}
```

**Поведение**:
- ✅ **Flexible**: Работает в flexbox и grid layouts
- ✅ **Consistent**: Использует дизайн-систему для размеров
- ✅ **Invisible**: Не занимает визуального пространства
- ✅ **Performance**: Минимум DOM элементов

**Примеры использования**:
```tsx
// В flexbox контейнере
<Container layout="flex" direction="column">
  <Heading level={2}>Заголовок</Heading>
  <Spacer size="md" />
  <Paragraph>Текст под заголовком</Paragraph>
  <Spacer size="lg" />
  <Button>Кнопка действия</Button>
</Container>

// В grid
<Container layout="grid" columns={2} gap={0}>
  <Card>Карточка 1</Card>
  <Spacer axis="horizontal" size="lg" />
  <Card>Карточка 2</Card>
</Container>
```

## Система типов и интерфейсов

### Базовые типы
```typescript
// Общие типы для всех блоков
export interface BaseBlockProps {
  blockId?: string;
  className?: string;
  children?: React.ReactNode;
}

// Типы для D&D
export interface DroppableBlockProps {
  droppableId?: string;
  isDropDisabled?: boolean;
}

// Типы для стилизации
export interface StylingProps {
  className?: string;
  style?: React.CSSProperties;
}

// Объединенный тип для всех блоков
export type BlockProps = BaseBlockProps & DroppableBlockProps & StylingProps;
```

### Утилиты для работы с блоками
```typescript
// Хук для работы с D&D
export const useBlockDroppable = (id: string, disabled?: boolean) => {
  // Реализация D&D логики
};

// Хук для стилизации блоков
export const useBlockStyling = (props: StylingProps) => {
  // Применение стилей и классов
};

// Утилита для генерации уникальных ID
export const generateBlockId = (): string => {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
```

## Интеграция с Drag & Drop системой

### Основные принципы:
1. **Все блоки droppable**: Каждый блок может принимать другие блоки
2. **Nested dragging**: Поддержка вложенного перетаскивания
3. **Visual feedback**: Четкая индикация возможных зон сброса
4. **Auto-layout**: Автоматическое позиционирование при вставке

### Реализация D&D:
```typescript
// Базовый HOC для D&D функциональности
export const withDroppable = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return React.memo((props: P & DroppableBlockProps) => {
    const { droppableId, isDropDisabled, ...rest } = props;

    const { isOver, setNodeRef } = useDroppable({
      id: droppableId || generateBlockId(),
      disabled: isDropDisabled,
    });

    return (
      <div
        ref={setNodeRef}
        className={clsx(
          'droppable-zone',
          isOver && 'droppable-zone--active'
        )}
      >
        <Component {...(rest as P)} />
      </div>
    );
  });
};
```

## Тестирование и QA

### Модульные тесты:
- ✅ Каждый блок тестируется отдельно
- ✅ Проверка всех props комбинаций
- ✅ Тестирование D&D функциональности
- ✅ Accessibility тесты

### Интеграционные тесты:
- ✅ Взаимодействие блоков друг с другом
- ✅ Работа в разных layout контекстах
- ✅ Responsive поведение
- ✅ Performance тесты

### E2E тесты:
- ✅ Создание страниц с помощью блоков
- ✅ Drag & drop в реальном сценарии
- ✅ Сохранение и загрузка контента

## Миграционный план

### Фаза 1: Создание базовых блоков (2 недели)
1. Реализовать Container, Section, Column
2. Создать систему типов и интерфейсов
3. Написать тесты для базовых блоков

### Фаза 2: Контентные блоки (2 недели)
1. Реализовать Button, Heading, Paragraph, Image, Spacer
2. Интегрировать с D&D системой
3. Оптимизировать производительность

### Фаза 3: Миграция существующих компонентов (3 недели)
1. Заменить старые компоненты на новые блоки
2. Обновить все импорты в приложении
3. Провести регрессионное тестирование

### Фаза 4: Оптимизация и полировка (1 неделя)
1. Финальная оптимизация производительности
2. Документирование API
3. Создание примеров использования

## Заключение

Эта спецификация определяет фундамент для чистой, переиспользуемой библиотеки блоков, которая:

- ✅ **Атомарна**: Каждый блок имеет единственную ответственность
- ✅ **Композитна**: Блоки легко комбинируются друг с другом
- ✅ **D&D Ready**: Полная поддержка drag & drop из коробки
- ✅ **Производительна**: Оптимизирована для больших приложений
- ✅ **Доступна**: Соответствует современным стандартам accessibility
- ✅ **Типобезопасна**: Полная TypeScript поддержка

Базовая библиотека из 8 блоков покроет 90% потребностей CMS, а остальные блоки можно будет построить путем композиции этих базовых элементов.
