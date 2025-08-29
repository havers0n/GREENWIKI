# 🎨 Руководство по Frontend Реализации

## 📋 Содержание
1. [Обзор Frontend Архитектуры](#-обзор-frontend-архитектуры)
2. [State Management для Иерархических Блоков](#-state-management-для-иерархических-блоков)
3. [Реализация Рекурсивного Рендеринга](#-реализация-рекурсивного-рендеринга)
4. [Drag & Drop с Поддержкой Иерархии](#drag--drop-с-поддержкой-иерархии)
5. [UI для Переиспользуемых Блоков](#ui-для-переиспользуемых-блоков)
6. [Система Overrides в Интерфейсе](#-система-overrides-в-интерфейсе)
7. [Оптимизации Производительности](#-оптимизации-производительности)
8. [Тестирование и Качество Кода](#-тестирование-и-качество-кода)

---

## 🏗️ Обзор Frontend Архитектуры

### Текущая Структура vs Новая Архитектура

```typescript
// Текущая структура состояния
interface CurrentState {
  blocks: Block[];
  selectedBlockId: string | null;
  editorMode: boolean;
}

// Новая структура состояния
interface NewState {
  pages: {
    [pageId: string]: {
      blocks: BlockTree;
      instances: BlockInstance[];
      reusableBlocks: ReusableBlockSummary[];
      selectedBlockId: string | null;
      editorMode: boolean;
      loading: boolean;
      error: string | null;
    };
  };
  reusableBlocksLibrary: {
    items: ReusableBlock[];
    categories: string[];
    searchQuery: string;
    selectedCategory: string | null;
    loading: boolean;
  };
  dragState: {
    isDragging: boolean;
    draggedBlock: BlockNode | null;
    dropTarget: DropTarget | null;
  };
}
```

### Ключевые Компоненты Новой Архитектуры

```typescript
// Основные компоненты
interface FrontendArchitecture {
  // Управление состоянием
  stores: {
    PageStore: PageStateManager;
    ReusableBlocksStore: ReusableBlocksManager;
    DragDropStore: DragDropManager;
  };

  // API слой
  api: {
    PageAPI: PageBlocksAPI;
    ReusableBlocksAPI: ReusableBlocksAPI;
    BlockOperationsAPI: BlockOperationsAPI;
  };

  // UI компоненты
  components: {
    PageEditor: PageEditor;
    BlockRenderer: EnhancedBlockRenderer;
    ReusableBlocksLibrary: ReusableBlocksLibrary;
    BlockTreeNavigator: BlockTreeNavigator;
    OverridesPanel: OverridesPanel;
  };

  // Утилиты
  utils: {
    BlockTreeUtils: BlockTreeUtils;
    OverrideManager: OverrideManager;
    ValidationUtils: ValidationUtils;
  };
}
```

---

## 🗂️ State Management для Иерархических Блоков

### Redux/Zustand Структура

```typescript
// Определения типов
interface BlockNode {
  id: string;
  block_type: string;
  content: Record<string, any>;
  effectiveContent: Record<string, any>;
  position: number;
  parent_block_id: string | null;
  slot: string | null;
  depth: number;
  isInstanceRoot: boolean;
  instanceId?: string;
  children: BlockNode[];
  metadata: Record<string, any>;
}

interface PageState {
  pageIdentifier: string;
  blocks: BlockNode[];
  instances: BlockInstance[];
  selectedBlockId: string | null;
  editorMode: boolean;
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
}

// Store для управления страницей
interface PageStore {
  pages: Record<string, PageState>;

  // Actions
  loadPage: (pageIdentifier: string) => Promise<void>;
  updateBlock: (pageId: string, blockId: string, updates: Partial<BlockNode>) => void;
  addBlock: (pageId: string, block: CreateBlockRequest, parentId?: string) => Promise<void>;
  deleteBlock: (pageId: string, blockId: string) => Promise<void>;
  moveBlock: (pageId: string, blockId: string, newParentId: string | null, newPosition: number, slot?: string) => Promise<void>;
  selectBlock: (pageId: string, blockId: string | null) => void;
  toggleEditorMode: (pageId: string) => void;

  // Selectors
  getPageBlocks: (pageId: string) => BlockNode[];
  getSelectedBlock: (pageId: string) => BlockNode | null;
  getBlockById: (pageId: string, blockId: string) => BlockNode | null;
  getBlocksByParent: (pageId: string, parentId: string | null, slot?: string) => BlockNode[];
  isEditorMode: (pageId: string) => boolean;
}
```

### Zustand Implementation

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface PageStoreState extends PageStore {
  // Внутреннее состояние
  _loadingStates: Record<string, boolean>;
  _errors: Record<string, string | null>;

  // Actions implementations
  loadPage: async (pageIdentifier: string) => {
    try {
      this._loadingStates[pageIdentifier] = true;

      const response = await fetch(`/api/pages/${pageIdentifier}/blocks`);
      const data = await response.json();

      this.pages[pageIdentifier] = {
        pageIdentifier,
        blocks: data.blocks,
        instances: data.instances,
        selectedBlockId: null,
        editorMode: false,
        loading: false,
        error: null,
        lastFetched: new Date().toISOString()
      };

      this._loadingStates[pageIdentifier] = false;
    } catch (error) {
      this._errors[pageIdentifier] = error.message;
      this._loadingStates[pageIdentifier] = false;
    }
  };

  updateBlock: (pageId: string, blockId: string, updates: Partial<BlockNode>) => {
    const page = this.pages[pageId];
    if (!page) return;

    // Рекурсивное обновление блока в дереве
    const updateBlockInTree = (blocks: BlockNode[]): BlockNode[] => {
      return blocks.map(block => {
        if (block.id === blockId) {
          return { ...block, ...updates };
        }
        if (block.children.length > 0) {
          return {
            ...block,
            children: updateBlockInTree(block.children)
          };
        }
        return block;
      });
    };

    page.blocks = updateBlockInTree(page.blocks);
  };

  addBlock: async (pageId: string, blockData: CreateBlockRequest, parentId?: string) => {
    try {
      const response = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...blockData,
          page_identifier: pageId,
          parent_block_id: parentId || null
        })
      });

      const { data: newBlock } = await response.json();

      // Добавление блока в дерево
      this.addBlockToTree(pageId, newBlock, parentId);
    } catch (error) {
      console.error('Failed to add block:', error);
    }
  };
}

export const usePageStore = create<PageStoreState>()(
  devtools(
    (set, get) => ({
      pages: {},
      _loadingStates: {},
      _errors: {},

      // Реализация actions...
    }),
    { name: 'PageStore' }
  )
);
```

### Store для Переиспользуемых Блоков

```typescript
interface ReusableBlocksState {
  items: ReusableBlock[];
  categories: string[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };

  // Actions
  loadReusableBlocks: (params?: SearchParams) => Promise<void>;
  searchBlocks: (query: string) => Promise<void>;
  filterByCategory: (category: string | null) => void;
  instantiateBlock: (reusableBlockId: string, targetPage: string, config: InstantiateConfig) => Promise<void>;
  refreshLibrary: () => Promise<void>;
}

export const useReusableBlocksStore = create<ReusableBlocksState>()(
  devtools(
    (set, get) => ({
      items: [],
      categories: [],
      loading: false,
      error: null,
      searchQuery: '',
      selectedCategory: null,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        hasMore: false
      },

      loadReusableBlocks: async (params = {}) => {
        set({ loading: true, error: null });

        try {
          const queryParams = new URLSearchParams({
            limit: get().pagination.limit.toString(),
            offset: ((get().pagination.page - 1) * get().pagination.limit).toString(),
            ...params
          });

          const response = await fetch(`/api/reusable-blocks?${queryParams}`);
          const data = await response.json();

          set({
            items: data.items,
            categories: data.meta.categories,
            pagination: {
              ...get().pagination,
              total: data.total,
              hasMore: data.hasMore
            },
            loading: false
          });
        } catch (error) {
          set({
            error: error.message,
            loading: false
          });
        }
      }
    }),
    { name: 'ReusableBlocksStore' }
  )
);
```

---

## 🔄 Реализация Рекурсивного Рендеринга

### Enhanced BlockRenderer Component

```typescript
import React, { useMemo, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { BlockWrapper } from './BlockWrapper';
import { Slot } from './Slot';
import { usePageStore } from '../stores/pageStore';

interface EnhancedBlockRendererProps {
  pageId: string;
  maxDepth?: number;
  showSlots?: boolean;
  onBlockSelect?: (blockId: string | null) => void;
  onBlockUpdate?: (blockId: string, updates: Partial<BlockNode>) => void;
}

export const EnhancedBlockRenderer: React.FC<EnhancedBlockRendererProps> = ({
  pageId,
  maxDepth = 10,
  showSlots = true,
  onBlockSelect,
  onBlockUpdate
}) => {
  const blocks = usePageStore(state => state.getPageBlocks(pageId));
  const selectedBlockId = usePageStore(state => state.getSelectedBlock(pageId)?.id || null);
  const editorMode = usePageStore(state => state.isEditorMode(pageId));

  // Мемоизированный рендеринг дерева
  const renderBlockTree = useCallback((
    blockNodes: BlockNode[],
    depth: number,
    parentId: string | null = null,
    slotName?: string
  ): React.ReactNode => {
    if (depth > maxDepth) {
      return (
        <div className="text-red-500 p-2 border border-red-300 rounded">
          Максимальная глубина дерева достигнута ({maxDepth})
        </div>
      );
    }

    return blockNodes.map((block, index) => (
      <React.Fragment key={block.id}>
        {/* Slot перед блоком */}
        {showSlots && editorMode && (
          <Slot
            index={index}
            slotName={slotName}
            parentId={parentId}
            onDrop={(droppedBlock) => handleBlockDrop(droppedBlock, parentId, index, slotName)}
          />
        )}

        {/* Рендеринг блока */}
        <BlockNodeRenderer
          block={block}
          depth={depth}
          isSelected={selectedBlockId === block.id}
          editorMode={editorMode}
          onSelect={() => onBlockSelect?.(block.id)}
          onUpdate={(updates) => onBlockUpdate?.(block.id, updates)}
        />

        {/* Рекурсивный рендеринг дочерних блоков */}
        {block.children.length > 0 && (
          <div className="ml-4 border-l-2 border-gray-200 pl-4">
            {renderBlockTree(block.children, depth + 1, block.id)}
          </div>
        )}

        {/* Slot после блока */}
        {showSlots && editorMode && index === blockNodes.length - 1 && (
          <Slot
            index={index + 1}
            slotName={slotName}
            parentId={parentId}
            onDrop={(droppedBlock) => handleBlockDrop(droppedBlock, parentId, index + 1, slotName)}
          />
        )}
      </React.Fragment>
    ));
  }, [maxDepth, showSlots, editorMode, selectedBlockId, onBlockSelect, onBlockUpdate]);

  // Обработчик дропа блоков
  const handleBlockDrop = useCallback((
    droppedBlock: BlockNode,
    targetParentId: string | null,
    targetPosition: number,
    targetSlot?: string
  ) => {
    // Обновление позиции блока в store
    usePageStore.getState().moveBlock(
      pageId,
      droppedBlock.id,
      targetParentId,
      targetPosition,
      targetSlot
    );
  }, [pageId]);

  return (
    <div className="block-renderer">
      {blocks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Нет блоков для отображения
        </div>
      ) : (
        renderBlockTree(blocks, 0)
      )}
    </div>
  );
};
```

### BlockNodeRenderer Component

```typescript
interface BlockNodeRendererProps {
  block: BlockNode;
  depth: number;
  isSelected: boolean;
  editorMode: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<BlockNode>) => void;
}

export const BlockNodeRenderer: React.FC<BlockNodeRendererProps> = ({
  block,
  depth,
  isSelected,
  editorMode,
  onSelect,
  onUpdate
}) => {
  const blockSpec = useBlockRegistry(block.block_type);
  const Component = blockSpec?.Renderer;

  // Drag and drop hooks
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: `block-${block.id}`,
    data: { block, type: 'block' }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1
  };

  if (!Component) {
    return (
      <BlockWrapper
        ref={setNodeRef}
        style={style}
        depth={depth}
        isSelected={isSelected}
        editorMode={editorMode}
        onClick={onSelect}
        {...attributes}
        {...listeners}
      >
        <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded">
          Неизвестный тип блока: {block.block_type}
        </div>
      </BlockWrapper>
    );
  }

  return (
    <BlockWrapper
      ref={setNodeRef}
      style={style}
      depth={depth}
      isSelected={isSelected}
      editorMode={editorMode}
      onClick={onSelect}
      {...attributes}
      {...listeners}
    >
      <React.Suspense fallback={<BlockSkeleton />}>
        <Component
          // Используем effectiveContent вместо content для экземпляров
          {...block.effectiveContent}
          // Метаданные для стилизации
          metadata={block.metadata}
          // Пропы для редактора
          editorMode={editorMode}
          blockId={block.id}
          isInstance={!!block.instanceId}
          instanceId={block.instanceId}
          onUpdate={onUpdate}
          // Дополнительные пропы для контейнеров
          allBlocks={[]} // Передаем только дочерние блоки
          selectedBlockId={isSelected ? block.id : null}
          onSelectBlock={() => {}} // Обработчик для дочерних блоков
        />
      </React.Suspense>
    </BlockWrapper>
  );
};
```

### BlockWrapper Component

```typescript
interface BlockWrapperProps {
  depth: number;
  isSelected: boolean;
  editorMode: boolean;
  isDragging?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const BlockWrapper = React.forwardRef<HTMLDivElement, BlockWrapperProps>(
  ({ depth, isSelected, editorMode, isDragging, children, onClick, style }, ref) => {
    const baseClasses = "relative transition-all duration-200";

    const depthClasses = {
      0: "ml-0",
      1: "ml-4",
      2: "ml-8",
      3: "ml-12"
    }[Math.min(depth, 3)] || "ml-16";

    const selectionClasses = isSelected
      ? "ring-2 ring-blue-500 shadow-lg bg-blue-50 dark:bg-blue-900/20"
      : "ring-1 ring-transparent hover:ring-blue-300";

    const editorClasses = editorMode
      ? `${selectionClasses} cursor-pointer`
      : "";

    const classes = [
      baseClasses,
      depthClasses,
      editorClasses,
      isDragging && "opacity-50"
    ].filter(Boolean).join(" ");

    return (
      <div
        ref={ref}
        className={classes}
        onClick={onClick}
        style={style}
        data-block-id={block?.id}
        data-depth={depth}
      >
        {/* Индикатор глубины */}
        {depth > 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600" />
        )}

        {/* Контент блока */}
        <div className="p-2">
          {children}
        </div>

        {/* Элементы управления для редактора */}
        {editorMode && (
          <BlockControls
            blockId={block?.id}
            isSelected={isSelected}
            depth={depth}
          />
        )}
      </div>
    );
  }
);
```

---

## 🎯 Drag & Drop с Поддержкой Иерархии

### DndContext Setup

```typescript
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export const PageEditor: React.FC<{ pageId: string }> = ({ pageId }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const [draggedBlock, setDraggedBlock] = useState<BlockNode | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const block = findBlockById(active.id as string);
    setDraggedBlock(block);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setDraggedBlock(null);
      return;
    }

    const draggedBlockId = active.id as string;
    const targetId = over.id as string;

    // Определение цели дропа
    const dropTarget = parseDropTarget(targetId);

    if (dropTarget) {
      handleBlockMove(draggedBlockId, dropTarget);
    }

    setDraggedBlock(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="page-editor">
        <EnhancedBlockRenderer pageId={pageId} />

        <DragOverlay>
          {draggedBlock && (
            <BlockDragPreview block={draggedBlock} />
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
};
```

### Slot Component для Drop Zones

```typescript
interface SlotProps {
  index: number;
  slotName?: string;
  parentId: string | null;
  onDrop: (block: BlockNode) => void;
}

export const Slot: React.FC<SlotProps> = ({
  index,
  slotName,
  parentId,
  onDrop
}) => {
  const {
    setNodeRef,
    isOver,
    active
  } = useDroppable({
    id: generateSlotId(parentId, slotName, index),
    data: {
      type: 'slot',
      parentId,
      slotName,
      index
    }
  });

  const isValidDrop = useMemo(() => {
    if (!active) return false;

    const draggedData = active.data.current;
    if (draggedData?.type !== 'block') return false;

    const draggedBlock = draggedData.block as BlockNode;

    // Валидация возможности дропа
    return validateDropTarget(draggedBlock, parentId, slotName);
  }, [active, parentId, slotName]);

  const ringColor = isOver && isValidDrop
    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10'
    : isOver && !isValidDrop
    ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
    : 'border-gray-300 dark:border-gray-700';

  return (
    <div
      ref={setNodeRef}
      className={`my-2 rounded-md border border-dashed ${ringColor} flex items-center justify-center transition-all duration-200 h-8`}
      aria-label={`Вставить ${slotName ? `в ${slotName}` : ''} на позицию ${index + 1}`}
    >
      {isOver && isValidDrop && (
        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
          ➤ Вставить сюда
        </span>
      )}
      {isOver && !isValidDrop && (
        <span className="text-xs text-red-600 dark:text-red-400 font-medium">
          ❌ Нельзя вставить
        </span>
      )}
    </div>
  );
};
```

### Валидация Drop Targets

```typescript
export interface DropTarget {
  type: 'slot' | 'canvas' | 'block';
  parentId: string | null;
  slotName?: string;
  index: number;
}

export function parseDropTarget(dropId: string): DropTarget | null {
  // slot:parentId:slotName:index
  // canvas:parentId:index
  // block:blockId

  const parts = dropId.split(':');

  if (parts[0] === 'slot') {
    return {
      type: 'slot',
      parentId: parts[1] === 'null' ? null : parts[1],
      slotName: parts[2],
      index: parseInt(parts[3], 10)
    };
  }

  if (parts[0] === 'canvas') {
    return {
      type: 'canvas',
      parentId: parts[1] === 'null' ? null : parts[1],
      index: parseInt(parts[2], 10)
    };
  }

  if (parts[0] === 'block') {
    // Дроп на блок (вставка после него)
    return {
      type: 'block',
      parentId: null, // Нужно определить из контекста
      index: 0 // Нужно определить из контекста
    };
  }

  return null;
}

export function validateDropTarget(
  draggedBlock: BlockNode,
  targetParentId: string | null,
  targetSlot?: string
): boolean {
  // Получение спецификации блока
  const blockSpec = getBlockSpec(draggedBlock.block_type);
  if (!blockSpec) return false;

  // Если нет родителя, то корневые блоки всегда допустимы
  if (!targetParentId) return true;

  // Получение спецификации родительского блока
  const parentBlock = findBlockById(targetParentId);
  if (!parentBlock) return false;

  const parentSpec = getBlockSpec(parentBlock.block_type);
  if (!parentSpec) return false;

  // Проверка allowedChildren
  if (parentSpec.allowedChildren &&
      !parentSpec.allowedChildren.includes(draggedBlock.block_type)) {
    return false;
  }

  // Проверка слота, если указан
  if (targetSlot) {
    // Для динамических слотов (tabs, accordion)
    if (parentBlock.block_type === 'tabs_block' || parentBlock.block_type === 'accordion_block') {
      const content = parentBlock.effectiveContent;
      if (parentBlock.block_type === 'tabs_block' && content.tabs) {
        return content.tabs.some((tab: any) => tab.id === targetSlot);
      }
      if (parentBlock.block_type === 'accordion_block' && content.sections) {
        return content.sections.some((section: any) => section.id === targetSlot);
      }
    }

    // Для статических слотов
    if (parentSpec.allowedSlots && !parentSpec.allowedSlots.includes(targetSlot)) {
      return false;
    }
  }

  // Проверка глубины
  const newDepth = calculateDepth(targetParentId) + 1;
  if (newDepth > 10) return false;

  return true;
}
```

---

## 🎨 UI для Переиспользуемых Блоков

### ReusableBlocksLibrary Component

```typescript
export const ReusableBlocksLibrary: React.FC = () => {
  const {
    items,
    categories,
    loading,
    error,
    searchQuery,
    selectedCategory,
    pagination,
    loadReusableBlocks,
    searchBlocks,
    filterByCategory,
    instantiateBlock
  } = useReusableBlocksStore();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadReusableBlocks();
    }
  }, [isOpen, loadReusableBlocks]);

  const handleSearch = useCallback(
    debounce((query: string) => {
      searchBlocks(query);
    }, 300),
    [searchBlocks]
  );

  const handleInstantiate = useCallback(async (blockId: string) => {
    // Определение текущей страницы для инстанцирования
    const currentPageId = getCurrentPageId();

    await instantiateBlock(blockId, currentPageId, {
      parentBlockId: null,
      position: 0
    });

    setIsOpen(false);
  }, [instantiateBlock]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Добавить блок
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Библиотека переиспользуемых блоков</DialogTitle>
        </DialogHeader>

        {/* Поиск и фильтры */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Поиск блоков..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full"
            />
          </div>
          <Select
            value={selectedCategory || ''}
            onValueChange={(value) => filterByCategory(value || null)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Все категории" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все категории</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Сетка блоков */}
        <ScrollArea className="flex-1">
          {loading ? (
            <BlocksGridSkeleton />
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Ошибка загрузки: {error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(block => (
                <BlockCard
                  key={block.id}
                  block={block}
                  onInstantiate={() => handleInstantiate(block.id)}
                />
              ))}
            </div>
          )}

          {/* Пагинация */}
          {pagination.hasMore && (
            <div className="text-center mt-4">
              <Button
                variant="outline"
                onClick={() => loadReusableBlocks({
                  offset: pagination.page * pagination.limit
                })}
                disabled={loading}
              >
                Загрузить еще
              </Button>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
```

### BlockCard Component

```typescript
interface BlockCardProps {
  block: ReusableBlock;
  onInstantiate: () => void;
}

export const BlockCard: React.FC<BlockCardProps> = ({
  block,
  onInstantiate
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    // Загрузка превью изображения
    if (block.previewImageUrl) {
      // Ленивая загрузка изображения
    }
  }, [block.previewImageUrl]);

  return (
    <Card className="group cursor-pointer transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm font-medium line-clamp-2">
              {block.name}
            </CardTitle>
            <CardDescription className="text-xs mt-1 line-clamp-2">
              {block.description}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            {block.category}
          </Badge>
        </div>
      </CardHeader>

      {/* Превью изображение */}
      <CardContent className="pt-0">
        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-md mb-3 overflow-hidden">
          {previewImage ? (
            <img
              src={previewImage}
              alt={block.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Blocks className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Теги */}
        {block.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {block.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {block.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{block.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Статистика использования */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Использований: {block.usageCount}</span>
          <span>v{block.version}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          onClick={onInstantiate}
          className="w-full"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить на страницу
        </Button>
      </CardFooter>
    </Card>
  );
};
```

---

## ⚙️ Система Overrides в Интерфейсе

### OverridesPanel Component

```typescript
interface OverridesPanelProps {
  instanceId: string;
  blockId: string;
  currentOverrides: OverrideMap;
  onOverridesChange: (overrides: OverrideMap) => void;
}

export const OverridesPanel: React.FC<OverridesPanelProps> = ({
  instanceId,
  blockId,
  currentOverrides,
  onOverridesChange
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const blockOverrides = currentOverrides[blockId] || {};
  const blockSpec = useBlockRegistry(findBlockById(blockId)?.block_type || '');

  const handleOverrideChange = useCallback((
    propertyPath: string,
    value: any,
    removeOverride = false
  ) => {
    const newOverrides = { ...currentOverrides };

    if (removeOverride) {
      if (newOverrides[blockId]) {
        delete newOverrides[blockId][propertyPath];
        if (Object.keys(newOverrides[blockId]).length === 0) {
          delete newOverrides[blockId];
        }
      }
    } else {
      if (!newOverrides[blockId]) {
        newOverrides[blockId] = {};
      }
      setNestedProperty(newOverrides[blockId], propertyPath, value);
    }

    onOverridesChange(newOverrides);
  }, [blockId, currentOverrides, onOverridesChange]);

  if (!blockSpec) {
    return (
      <div className="p-4 text-center text-gray-500">
        Спецификация блока не найдена
      </div>
    );
  }

  return (
    <div className="overrides-panel">
      <div className="p-4 border-b">
        <h3 className="font-medium">Переопределения для блока</h3>
        <p className="text-sm text-gray-600 mt-1">
          Измените свойства этого экземпляра блока
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Переопределения контента */}
          <OverridesSection
            title="Содержимое"
            icon={<Type className="w-4 h-4" />}
            expanded={expandedSections.has('content')}
            onToggle={() => toggleSection('content')}
          >
            <ContentOverridesEditor
              blockSpec={blockSpec}
              overrides={blockOverrides}
              onChange={handleOverrideChange}
            />
          </OverridesSection>

          {/* Переопределения стилей */}
          <OverridesSection
            title="Стили"
            icon={<Palette className="w-4 h-4" />}
            expanded={expandedSections.has('styles')}
            onToggle={() => toggleSection('styles')}
          >
            <StyleOverridesEditor
              blockSpec={blockSpec}
              overrides={blockOverrides}
              onChange={handleOverrideChange}
            />
          </OverridesSection>

          {/* Переопределения поведения */}
          <OverridesSection
            title="Поведение"
            icon={<Settings className="w-4 h-4" />}
            expanded={expandedSections.has('behavior')}
            onToggle={() => toggleSection('behavior')}
          >
            <BehaviorOverridesEditor
              blockSpec={blockSpec}
              overrides={blockOverrides}
              onChange={handleOverrideChange}
            />
          </OverridesSection>
        </div>
      </ScrollArea>

      {/* Действия */}
      <div className="p-4 border-t flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOverridesChange({})}
        >
          Сбросить все
        </Button>
        <Button size="sm">
          Применить изменения
        </Button>
      </div>
    </div>
  );
};
```

### ContentOverridesEditor Component

```typescript
interface ContentOverridesEditorProps {
  blockSpec: BlockSpec;
  overrides: Record<string, any>;
  onChange: (path: string, value: any, remove?: boolean) => void;
}

export const ContentOverridesEditor: React.FC<ContentOverridesEditorProps> = ({
  blockSpec,
  overrides,
  onChange
}) => {
  const renderOverrideField = (fieldName: string, fieldSchema: any) => {
    const currentValue = getNestedProperty(overrides, fieldName);
    const hasOverride = currentValue !== undefined;

    const handleChange = (value: any) => {
      onChange(fieldName, value);
    };

    const handleReset = () => {
      onChange(fieldName, null, true);
    };

    // Определение типа поля и рендеринг соответствующего компонента
    switch (fieldSchema.type) {
      case 'string':
        return (
          <StringOverrideField
            label={fieldName}
            value={currentValue}
            hasOverride={hasOverride}
            onChange={handleChange}
            onReset={handleReset}
          />
        );

      case 'number':
        return (
          <NumberOverrideField
            label={fieldName}
            value={currentValue}
            hasOverride={hasOverride}
            onChange={handleChange}
            onReset={handleReset}
          />
        );

      case 'boolean':
        return (
          <BooleanOverrideField
            label={fieldName}
            value={currentValue}
            hasOverride={hasOverride}
            onChange={handleChange}
            onReset={handleReset}
          />
        );

      default:
        return (
          <div className="text-sm text-gray-500">
            Тип поля не поддерживается: {fieldSchema.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-3">
      {Object.entries(blockSpec.schema.shape).map(([fieldName, fieldSchema]) => (
        <div key={fieldName} className="space-y-2">
          {renderOverrideField(fieldName, fieldSchema)}
        </div>
      ))}
    </div>
  );
};
```

---

## 🚀 Оптимизации Производительности

### React.memo и useMemo Оптимизации

```typescript
// Мемоизированный рендеринг блоков
const BlockNodeRenderer = React.memo<BlockNodeRendererProps>(({
  block,
  depth,
  isSelected,
  editorMode,
  onSelect,
  onUpdate
}) => {
  // Мемоизированные вычисления
  const blockSpec = useMemo(() =>
    blockRegistry[block.block_type],
    [block.block_type]
  );

  const Component = useMemo(() =>
    blockSpec?.Renderer,
    [blockSpec]
  );

  const isDraggable = useMemo(() =>
    editorMode && blockSpec?.draggable !== false,
    [editorMode, blockSpec]
  );

  // Мемоизированные колбэки
  const handleSelect = useCallback(() => {
    onSelect();
  }, [onSelect]);

  const handleUpdate = useCallback((updates: Partial<BlockNode>) => {
    onUpdate(updates);
  }, [onUpdate]);

  // Только ререндерим при изменении этих пропов
  return (
    // ... компонент
  );
}, (prevProps, nextProps) => {
  // Кастомная функция сравнения для оптимизации
  return (
    prevProps.block.id === nextProps.block.id &&
    prevProps.block.effectiveContent === nextProps.block.effectiveContent &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.editorMode === nextProps.editorMode &&
    prevProps.depth === nextProps.depth
  );
});
```

### Виртуализация для Больших Деревьев

```typescript
import { FixedSizeTree } from 'react-vtree';

interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
  height: number;
  isOpenByDefault: boolean;
}

export const VirtualizedBlockTree: React.FC<{ blocks: BlockNode[] }> = ({ blocks }) => {
  const treeWalker = useMemo(() => {
    return function* treeWalker(): Generator<TreeNode> {
      for (const block of blocks) {
        yield {
          id: block.id,
          name: `${block.block_type} (${block.id})`,
          children: getBlockChildren(block.id),
          height: 32,
          isOpenByDefault: block.depth < 2
        };
      }
    };
  }, [blocks]);

  const handleNodeClick = useCallback((node: TreeNode) => {
    // Обработка клика по узлу дерева
    selectBlock(node.id);
  }, []);

  return (
    <FixedSizeTree
      treeWalker={treeWalker}
      itemSize={32}
      height={400}
      width="100%"
    >
      {({ style, node }) => (
        <div style={style} onClick={() => handleNodeClick(node)}>
          <BlockTreeNode node={node} />
        </div>
      )}
    </FixedSizeTree>
  );
};
```

### Lazy Loading для Блоков

```typescript
// Lazy loading для тяжелых блоков
const LazyBlockRenderer = React.lazy(() =>
  import('./HeavyBlockRenderer').then(module => ({
    default: module.HeavyBlockRenderer
  }))
);

// Suspense boundary для блоков
export const BlockRendererWithSuspense: React.FC<BlockRendererProps> = (props) => {
  const isHeavyBlock = props.block.content.complexity > 10;

  if (isHeavyBlock) {
    return (
      <React.Suspense fallback={<BlockSkeleton />}>
        <LazyBlockRenderer {...props} />
      </React.Suspense>
    );
  }

  return <BlockRenderer {...props} />;
};
```

---

## 🧪 Тестирование и Качество Кода

### Unit Tests для Компонентов

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { EnhancedBlockRenderer } from './EnhancedBlockRenderer';

describe('EnhancedBlockRenderer', () => {
  const mockBlocks: BlockNode[] = [
    {
      id: 'block-1',
      block_type: 'heading',
      content: { text: 'Test Heading' },
      effectiveContent: { text: 'Test Heading' },
      position: 0,
      parent_block_id: null,
      slot: null,
      depth: 0,
      isInstanceRoot: false,
      children: []
    }
  ];

  it('renders blocks correctly', () => {
    render(
      <EnhancedBlockRenderer
        pageId="test-page"
        blocks={mockBlocks}
        editorMode={false}
      />
    );

    expect(screen.getByText('Test Heading')).toBeInTheDocument();
  });

  it('handles block selection in editor mode', () => {
    const mockOnSelect = jest.fn();

    render(
      <EnhancedBlockRenderer
        pageId="test-page"
        blocks={mockBlocks}
        editorMode={true}
        onBlockSelect={mockOnSelect}
      />
    );

    const blockElement = screen.getByText('Test Heading').closest('[data-block-id]');
    fireEvent.click(blockElement!);

    expect(mockOnSelect).toHaveBeenCalledWith('block-1');
  });

  it('renders nested blocks with proper indentation', () => {
    const nestedBlocks: BlockNode[] = [
      {
        ...mockBlocks[0],
        children: [
          {
            id: 'block-2',
            block_type: 'paragraph',
            content: { text: 'Nested content' },
            effectiveContent: { text: 'Nested content' },
            position: 0,
            parent_block_id: 'block-1',
            slot: null,
            depth: 1,
            isInstanceRoot: false,
            children: []
          }
        ]
      }
    ];

    render(
      <EnhancedBlockRenderer
        pageId="test-page"
        blocks={nestedBlocks}
        editorMode={true}
      />
    );

    const nestedBlock = screen.getByText('Nested content').closest('[data-depth="1"]');
    expect(nestedBlock).toBeInTheDocument();
  });
});
```

### Integration Tests для Блоков

```typescript
describe('Block Operations Integration', () => {
  let testPageId: string;

  beforeEach(async () => {
    // Создание тестовой страницы
    testPageId = await createTestPage();
  });

  afterEach(async () => {
    // Очистка тестовой страницы
    await cleanupTestPage(testPageId);
  });

  it('creates and renders a new block', async () => {
    const blockData = {
      block_type: 'heading',
      content: { text: 'New Block' },
      position: 0
    };

    // Создание блока через API
    const response = await api.createBlock(testPageId, blockData);
    expect(response.success).toBe(true);

    // Проверка рендеринга
    const { container } = render(
      <EnhancedBlockRenderer pageId={testPageId} />
    );

    await waitFor(() => {
      expect(screen.getByText('New Block')).toBeInTheDocument();
    });
  });

  it('handles drag and drop operations', async () => {
    // Создание двух блоков
    await api.createBlock(testPageId, {
      block_type: 'heading',
      content: { text: 'Block 1' },
      position: 0
    });

    await api.createBlock(testPageId, {
      block_type: 'paragraph',
      content: { text: 'Block 2' },
      position: 1
    });

    // Симуляция drag and drop
    const { container } = render(
      <DndContext>
        <EnhancedBlockRenderer pageId={testPageId} editorMode={true} />
      </DndContext>
    );

    // ... drag and drop assertions
  });
});
```

### E2E Tests с Playwright

```typescript
import { test, expect } from '@playwright/test';

test.describe('Page Editor', () => {
  test('creates and edits blocks', async ({ page }) => {
    await page.goto('/admin/pages/test-page/editor');

    // Открытие библиотеки блоков
    await page.click('button:has-text("Добавить блок")');

    // Выбор блока из библиотеки
    await page.click('[data-testid="block-card-heading"]');
    await page.click('button:has-text("Добавить на страницу")');

    // Проверка появления блока
    await expect(page.locator('h1:has-text("New Heading")')).toBeVisible();

    // Редактирование блока
    await page.click('[data-testid="edit-block-button"]');
    await page.fill('input[name="text"]', 'Updated Heading');
    await page.click('button:has-text("Сохранить")');

    // Проверка обновления
    await expect(page.locator('h1:has-text("Updated Heading")')).toBeVisible();
  });

  test('handles drag and drop', async ({ page }) => {
    // Создание нескольких блоков
    // Симуляция drag and drop с помощью Playwright
    // Проверка нового порядка блоков
  });
});
```

---

## 🎯 Заключение

Frontend реализация представляет собой комплексное решение для работы с иерархическими блоками и переиспользуемыми компонентами:

### Ключевые Достижения:

1. **Модульная Архитектура**: Разделение на stores, API слой, компоненты и утилиты
2. **Оптимизированная Производительность**: React.memo, виртуализация, ленивая загрузка
3. **Интуитивный Drag & Drop**: Поддержка вложенности с визуальной обратной связью
4. **Гибкая Система Overrides**: Пользовательский интерфейс для переопределений
5. **Комплексное Тестирование**: Unit, integration и E2E тесты

### Масштабируемость:

- **Lazy Loading**: Динамическая загрузка компонентов блоков
- **Virtual Scrolling**: Поддержка больших деревьев
- **Code Splitting**: Разделение кода по маршрутам и типам блоков
- **Tree Shaking**: Удаление неиспользуемого кода

### Доступность:

- **Keyboard Navigation**: Поддержка клавиатурной навигации
- **Screen Reader**: ARIA-атрибуты для скринридеров
- **Focus Management**: Правильное управление фокусом
- **High Contrast**: Поддержка высококонтрастных тем

Реализация обеспечивает высокую производительность, отличный пользовательский опыт и готовность к будущему развитию платформы.
