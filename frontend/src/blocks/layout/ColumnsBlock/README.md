# ColumnsBlock

Компонент для создания многоколоночных макетов с поддержкой drag-and-drop.

## Особенности

- **CSS Grid Layout**: Современный и гибкий способ создания колонок
- **Drag & Drop**: Полная поддержка перетаскивания блоков в колонки
- **Адаптивность**: Автоматическая адаптация под содержимое
- **Настраиваемость**: Выбор количества колонок (2, 3, 4)

## Структура файлов

```
ColumnsBlock/
├── index.ts              # Основной экспорт
├── types/
│   └── index.ts          # TypeScript типы
├── model/
│   └── useColumnsLogic.ts # Логика и хуки
├── ui/
│   ├── ColumnsBlock.tsx      # Основной компонент рендеринга
│   └── ColumnsBlockEditor.tsx # Редактор настроек
└── README.md             # Документация
```

## Использование

### В режиме редактора

```tsx
import { ColumnsBlock } from 'blocks/layout/ColumnsBlock';

<ColumnsBlock
  layout="three"
  gap="medium"
  editorMode={true}
  blockId="columns-1"
  onSelectBlock={handleSelect}
/>
```

### В продакшн режиме

```tsx
<ColumnsBlock layout="three" gap="medium">
  {children}
</ColumnsBlock>
```

## API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `layout` | `'two' \| 'three' \| 'four'` | `'two'` | Количество колонок |
| `gap` | `'none' \| 'small' \| 'medium' \| 'large'` | `'medium'` | Расстояние между колонками |
| `editorMode` | `boolean` | `false` | Включить режим редактора |
| `blockId` | `string` | - | ID блока для D&D |
| `onSelectBlock` | `(id: string \| null) => void` | - | Callback при выборе блока |

## Редактор

Редактор позволяет:
- Выбирать количество колонок (2, 3, 4)
- Просматривать превью настроек
- Получать подсказки по использованию

## Drag & Drop

- Каждая колонка имеет свою drop zone
- Поддерживается вложение любых типов блоков
- Визуальная обратная связь при перетаскивании

## Стилизация

- Использует CSS Grid для равномерного распределения колонок
- Адаптивные отступы между колонками
- Поддержка кастомных цветов фона и скруглений
