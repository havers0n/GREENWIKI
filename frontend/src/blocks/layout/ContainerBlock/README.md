# ContainerBlock - Новая архитектура контейнеров

## Обзор

`ContainerBlock` - это рефакторинг монолитного компонента `ContainerSection` на чистые, переиспользуемые компоненты согласно новой архитектуре.

## Структура

```
ContainerBlock/
├── ui/
│   ├── ContainerBlock.tsx          # Чистый UI компонент
│   └── ContainerBlockEditor.tsx    # Компонент для CMS редактора
├── model/
│   └── useContainerLogic.ts        # Логика работы с контейнерами
├── types/
│   └── index.ts                    # TypeScript типы
├── example.tsx                     # Примеры использования
├── index.ts                        # Основной экспорт
└── README.md                       # Эта документация
```

## Принципы рефакторинга

### 🎯 Разделение ответственности:
- **ContainerBlock**: Чистый UI без логики
- **ContainerBlockEditor**: UI + логика редактирования
- **useContainerLogic**: Вся бизнес-логика в хуках

### 🔄 Композиция через children:
```tsx
<ContainerBlock layout="vertical" gap="medium">
  <div>Любой контент</div>
  <Button>Кнопка</Button>
  <Image src="..." />
</ContainerBlock>
```

### 📦 Независимость:
- Каждый компонент можно использовать отдельно
- Нет жестких зависимостей от CMS
- Поддержка D&D из коробки

## API

### ContainerBlock (чистый UI)

```tsx
interface ContainerProps {
  children: React.ReactNode;
  layout?: 'vertical' | 'horizontal' | 'grid';
  gap?: 'none' | 'small' | 'medium' | 'large';
  padding?: 'none' | 'small' | 'medium' | 'large';
  backgroundColor?: string;
  borderRadius?: string;
  maxWidth?: string;
  title?: string;
  className?: string;
}
```

### ContainerBlockEditor (для CMS)

```tsx
interface ContainerEditorProps extends ContainerProps {
  editorMode?: boolean;
  blockId?: string;
  allBlocks?: any[];
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string | null) => void;
  onUpdateBlock?: (block: any) => void;
}
```

## Примеры использования

### 1. Простой контейнер

```tsx
import { ContainerBlock } from 'blocks/layout/ContainerBlock';

<ContainerBlock
  layout="vertical"
  gap="medium"
  padding="large"
  backgroundColor="#f8fafc"
>
  <h3>Заголовок</h3>
  <p>Содержимое контейнера</p>
</ContainerBlock>
```

### 2. Контейнер для CMS

```tsx
import { ContainerBlockEditor } from 'blocks/layout/ContainerBlock';

<ContainerBlockEditor
  editorMode={true}
  blockId="container-123"
  allBlocks={blocks}
  selectedBlockId={selectedId}
  onSelectBlock={setSelectedId}
  layout="grid"
  gap="large"
>
  {/* Дочерние блоки будут здесь */}
</ContainerBlockEditor>
```

### 3. С кастомными хуками

```tsx
import { useContainerLogic } from 'blocks/layout/ContainerBlock';

const MyCustomContainer = () => {
  const { childBlocks, isEmpty } = useContainerLogic(blockId, allBlocks);

  return (
    <ContainerBlock layout="vertical">
      {isEmpty ? <EmptyState /> : childBlocks.map(renderBlock)}
    </ContainerBlock>
  );
};
```

## Миграция с ContainerSection

### Старый способ (устаревший):
```tsx
<ContainerSection
  layout="horizontal"
  gap="large"
  editorMode={true}
  blockId="container-123"
  allBlocks={blocks}
  selectedBlockId={selectedId}
  onSelectBlock={onSelectBlock}
  onUpdateBlock={onUpdateBlock}
/>
```

### Новый способ:
```tsx
<ContainerBlockEditor
  layout="horizontal"
  gap="large"
  editorMode={true}
  blockId="container-123"
  allBlocks={blocks}
  selectedBlockId={selectedId}
  onSelectBlock={onSelectBlock}
  onUpdateBlock={onUpdateBlock}
>
  {/* Дочерние блоки */}
</ContainerBlockEditor>
```

## Хуки

### useContainerLogic

```tsx
const { childBlocks, isEmpty, blockStats, hasChildren } = useContainerLogic(
  blockId,
  allBlocks,
  slot = 'default'
);
```

### useContainerStyles

```tsx
const styles = useContainerStyles(
  layout,
  gap,
  padding,
  backgroundColor,
  borderRadius,
  maxWidth
);
```

## D&D Поддержка

ContainerBlock полностью совместим с @dnd-kit:

```tsx
<ContainerBlock
  droppableId="my-container"
  isDropDisabled={false}
>
  {/* Контент */}
</ContainerBlock>
```

## Типы

Все компоненты полностью типизированы:

```tsx
import type {
  ContainerProps,
  ContainerEditorProps,
  ContainerLayout,
  ContainerGap,
  ContainerPadding
} from 'blocks/layout/ContainerBlock';
```

## Тестирование

### Модульные тесты:
```tsx
import { render, screen } from '@testing-library/react';
import { ContainerBlock } from 'blocks/layout/ContainerBlock';

test('renders children correctly', () => {
  render(
    <ContainerBlock>
      <div>Test content</div>
    </ContainerBlock>
  );

  expect(screen.getByText('Test content')).toBeInTheDocument();
});
```

### Тесты с D&D:
```tsx
test('supports drag and drop', () => {
  // Тесты с @dnd-kit/testing
});
```

## Производительность

- ✅ React.memo для предотвращения лишних перерендерингов
- ✅ useMemo для тяжелых вычислений
- ✅ Ленивая загрузка стилей
- ✅ Оптимизированные хуки

## Будущие улучшения

- [ ] Интеграция с Framer Motion для анимаций
- [ ] Поддержка CSS Grid с кастомными шаблонами
- [ ] Автоматическая адаптивность
- [ ] Темизация через CSS Variables

## Вопросы и ответы

**Q: Зачем нужен отдельный ContainerBlockEditor?**
A: Для разделения чистого UI (ContainerBlock) и логики CMS (ContainerBlockEditor).

**Q: Можно ли использовать ContainerBlock без CMS?**
A: Да, ContainerBlock - это чистый UI компонент без зависимостей от CMS.

**Q: Как добавить новые типы layout?**
A: Обновите тип `ContainerLayout` в `types/index.ts` и логику в `useContainerStyles`.

---

## Заключение

Новая архитектура ContainerBlock демонстрирует принципы:
- ✅ **Единственной ответственности**
- ✅ **Композиции через children**
- ✅ **Переиспользуемости**
- ✅ **Типобезопасности**
- ✅ **Тестируемости**

Рекомендуется использовать новую архитектуру для всех новых контейнеров.
