# Система управления древовидными блоками

## Обзор

Данная система представляет собой полностью переработанный стейт-менеджер для работы с иерархической древовидной структурой блоков. Вместо плоского массива теперь используется дерево с неограниченной вложенностью.

## Основные изменения

### 1. Типы данных

#### BlockNode (новый тип)
```typescript
interface BlockNode {
  id: string;
  block_type: string;
  content: Record<string, any> | null;
  depth: number;
  instance_id: string | null;
  metadata: Record<string, any>;
  page_id: number;
  position: number | null;
  slot: string | null;
  status: string;
  children: BlockNode[]; // Ключевое отличие!
}
```

#### LayoutApiResponse
```typescript
interface LayoutApiResponse {
  pageId: number;
  blocks: BlockNode[];
}
```

### 2. Actions (Экшены)

#### Новые экшены для работы с деревом

**setLayoutFromApi** - загрузка дерева из API
```typescript
dispatch(setLayoutFromApi({
  pageId: 123,
  blocks: treeData
}));
```

**addBlockToTree** - добавление блока в дерево
```typescript
dispatch(addBlockToTree({
  block: newBlock,
  parentId: 'parent-block-id', // или null для корневого уровня
  position: 0
}));
```

**updateBlockInTree** - обновление блока в дереве
```typescript
dispatch(updateBlockInTree({
  blockId: 'block-id',
  updates: { content: { text: 'New content' } }
}));
```

**removeBlockFromTree** - удаление блока из дерева
```typescript
dispatch(removeBlockFromTree('block-id'));
```

**moveBlockInTree** - перемещение блока в дереве
```typescript
dispatch(moveBlockInTree({
  blockId: 'block-id',
  newParentId: 'new-parent-id', // или null
  newPosition: 1
}));
```

#### Обратная совместимость
Все старые экшены (`setBlocks`, `addBlock`, `updateBlock`, `removeBlock`, `reorderBlocks`) остаются доступными для постепенной миграции.

### 3. Selectors (Селекторы)

#### Базовые селекторы
```typescript
// Получение дерева блоков
const blockTree = useBlockTree();

// Получение плоского массива (для обратной совместимости)
const blocksFlat = useBlocksFlat();
```

#### Поиск и навигация
```typescript
// Поиск блока по ID
const block = useBlockById('block-id');

// Получение выбранного блока
const selectedBlock = useSelectedBlock();

// Получение корневых блоков
const rootBlocks = useRootBlocks();

// Получение дочерних блоков
const children = useBlockChildren('parent-id'); // или null для корневых
```

#### Расширенные селекторы
```typescript
// Использование селекторов напрямую
import { selectBlockPath, selectBlockDescendants } from '../store/selectors/blockSelectors';

const blockPath = useAppSelector(state => selectBlockPath(state, 'block-id'));
const descendants = useAppSelector(state => selectBlockDescendants(state, 'block-id'));
```

## Примеры использования

### 1. Загрузка данных из API

```typescript
import { useAppDispatch } from '../store/hooks';
import { setLayoutFromApi } from '../store/slices/contentSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Загрузка дерева блоков с API
    fetch('/api/layout/admin/page-123')
      .then(response => response.json())
      .then((data: LayoutApiResponse) => {
        dispatch(setLayoutFromApi(data));
      });
  }, [dispatch]);

  return <div>Загрузка...</div>;
};
```

### 2. Добавление нового блока

```typescript
import { useAppDispatch } from '../store/hooks';
import { addBlockToTree } from '../store/slices/contentSlice';

const AddBlockButton = ({ parentId }: { parentId: string | null }) => {
  const dispatch = useAppDispatch();

  const handleAddBlock = () => {
    const newBlock: BlockNode = {
      id: 'new-block-' + Date.now(),
      block_type: 'text',
      content: { text: 'Новый текст' },
      depth: parentId ? 1 : 0,
      instance_id: null,
      metadata: {},
      page_id: 123,
      position: 0,
      slot: null,
      status: 'draft',
      children: []
    };

    dispatch(addBlockToTree({
      block: newBlock,
      parentId,
      position: 0
    }));
  };

  return (
    <button onClick={handleAddBlock}>
      Добавить блок
    </button>
  );
};
```

### 3. Отображение дерева блоков

```typescript
import { useBlockTree, useBlockChildren } from '../store/hooks';

const BlockTreeView = () => {
  const rootBlocks = useBlockTree();

  return (
    <div>
      {rootBlocks.map(block => (
        <BlockNode key={block.id} block={block} />
      ))}
    </div>
  );
};

const BlockNode = ({ block }: { block: BlockNode }) => {
  const children = useBlockChildren(block.id);
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div style={{ marginLeft: block.depth * 20 }}>
      <div onClick={() => setIsExpanded(!isExpanded)}>
        {block.block_type}: {block.content?.text || 'Блок'}
        {children.length > 0 && (isExpanded ? ' ▼' : ' ▶')}
      </div>

      {isExpanded && children.map(child => (
        <BlockNode key={child.id} block={child} />
      ))}
    </div>
  );
};
```

### 4. Перемещение блоков (Drag & Drop)

```typescript
import { useAppDispatch } from '../store/hooks';
import { moveBlockInTree } from '../store/slices/contentSlice';

const DroppableArea = ({
  parentId,
  position
}: {
  parentId: string | null;
  position: number;
}) => {
  const dispatch = useAppDispatch();

  const handleDrop = (draggedBlockId: string) => {
    dispatch(moveBlockInTree({
      blockId: draggedBlockId,
      newParentId: parentId,
      newPosition: position
    }));
  };

  return (
    <div
      className="drop-zone"
      onDrop={() => handleDrop('dragged-block-id')}
    >
      Перетащите блок сюда
    </div>
  );
};
```

## Архитектурные принципы

### 1. Иммутабельность
Все операции с деревом создают новые объекты, не мутируя существующие. Это обеспечивает предсказуемость и совместимость с Redux DevTools.

### 2. Рекурсивность
Все функции для работы с деревом реализованы рекурсивно, что позволяет работать с деревьями любой глубины вложенности.

### 3. Обратная совместимость
Система поддерживает как новую древовидную структуру, так и старый плоский массив для постепенной миграции компонентов.

### 4. Производительность
Селекторы оптимизированы и используют мемоизацию Redux. Поиск в дереве выполняется только при необходимости.

## Миграция с плоской структуры

### Шаг 1: Обновление типов
Замените использование `BlockData[]` на `BlockNode[]` в ваших компонентах.

### Шаг 2: Использование новых экшенов
Замените старые экшены на новые:
- `addBlock` → `addBlockToTree`
- `updateBlock` → `updateBlockInTree`
- `removeBlock` → `removeBlockFromTree`
- `reorderBlocks` → `moveBlockInTree`

### Шаг 3: Обновление селекторов
Используйте новые хуки:
- `useBlocksFlat()` → `useBlockTree()`
- Добавьте логику для работы с иерархией

## Тестирование

Для тестирования новой системы доступны вспомогательные функции в `treeUtils.ts`:

```typescript
import {
  findBlockById,
  findBlockParent,
  getBlocksByParentId,
  addBlockToTree,
  removeBlockFromTree,
  moveBlockInTree
} from '../store/slices/treeUtils';

// Используйте эти функции в ваших тестах
```

## Будущие улучшения

1. **Ленивая загрузка** - загрузка дочерних блоков по требованию
2. **Виртуализация** - оптимизация рендеринга больших деревьев
3. **Кеширование** - кеширование часто используемых поддеревьев
4. **Оптимистичные обновления** - мгновенный UI при операциях с сервером

## Заключение

Новая система управления блоками предоставляет мощный и гибкий способ работы с иерархическими данными. Она сохраняет обратную совместимость, обеспечивая плавный переход, и готова к будущим расширениям функциональности.
