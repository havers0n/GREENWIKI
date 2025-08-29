# 🚀 Спецификация Backend API

## 📋 Содержание
1. [Обзор Изменений API](#-обзор-изменений-api)
2. [Обновленные Эндпоинты для Иерархических Блоков](#-обновленные-эндпоинты-для-иерархических-блоков)
3. [Новые Эндпоинты для Переиспользуемых Блоков](#-новые-эндпоинты-для-переиспользуемых-блоков)
4. [DTO и Типы Данных](#-dto-и-типы-данных)
5. [Логика Hydration Экземпляров](#-логика-hydration-экземпляров)
6. [Обработка Ошибок](#-обработка-ошибок)
7. [Аутентификация и Авторизация](#-аутентификация-и-авторизация)
8. [Производительность и Кеширование](#-производительность-и-кеширование)

---

## 🔄 Обзор Изменений API

### Текущая Архитектура API

```typescript
// Текущий эндпоинт получения блоков страницы
GET /api/layout/:pageIdentifier
// Возвращает: LayoutBlock[]

interface LayoutBlock {
  id: string;
  block_type: string;
  content: any;
  position: number;
  parent_block_id: string | null;
  slot: string | null;
  metadata: Record<string, any>;
}
```

### Новая Архитектура API

```typescript
// Новый эндпоинт с полной поддержкой иерархии и экземпляров
GET /api/pages/:pageIdentifier/blocks
// Возвращает: PageBlockTree

interface PageBlockTree {
  blocks: BlockNode[];
  instances: BlockInstance[];
  reusableBlocks: ReusableBlockSummary[];
}

interface BlockNode {
  id: string;
  block_type: string;
  content: any;
  effectiveContent: any; // content + applied overrides
  position: number;
  parent_block_id: string | null;
  slot: string | null;
  depth: number;
  isInstanceRoot: boolean;
  instanceId?: string;
  children: BlockNode[];
  metadata: Record<string, any>;
}
```

### Ключевые Изменения

1. **Иерархическая Структура**: API теперь возвращает дерево блоков вместо плоского списка
2. **Поддержка Экземпляров**: Встроенная обработка переиспользуемых блоков с overrides
3. **Эффективный Content**: Предварительно вычисленный effective content для экземпляров
4. **Метаданные Дерева**: Информация о глубине, типах связей и экземплярах

---

## 🔧 Обновленные Эндпоинты для Иерархических Блоков

### GET /api/pages/:pageIdentifier/blocks

**Назначение**: Получение полного дерева блоков страницы с поддержкой иерархии и экземпляров

**Метод**: `GET`

**Параметры пути**:
- `pageIdentifier` (string): Идентификатор страницы

**Query параметры**:
- `status` (string, optional): Фильтр по статусу (`draft`, `published`). По умолчанию `published`
- `includeDrafts` (boolean, optional): Включать черновики для авторизованных пользователей
- `maxDepth` (number, optional): Максимальная глубина дерева (по умолчанию 10)

**Заголовки**:
- `Authorization`: Bearer token (для доступа к черновикам)
- `X-API-Key`: API ключ (опционально)

**Пример запроса**:
```bash
GET /api/pages/homepage/blocks?status=published&maxDepth=5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Пример ответа (200 OK)**:
```json
{
  "success": true,
  "data": {
    "pageIdentifier": "homepage",
    "blocks": [
      {
        "id": "section-1",
        "block_type": "container_section",
        "content": {
          "title": "Главная секция",
          "layout": "two"
        },
        "effectiveContent": {
          "title": "Главная секция",
          "layout": "two"
        },
        "position": 0,
        "parent_block_id": null,
        "slot": null,
        "depth": 0,
        "isInstanceRoot": false,
        "children": [
          {
            "id": "column-1",
            "block_type": "container_section",
            "content": {},
            "effectiveContent": {},
            "position": 0,
            "parent_block_id": "section-1",
            "slot": "column1",
            "depth": 1,
            "isInstanceRoot": false,
            "children": [
              {
                "id": "heading-1",
                "block_type": "heading",
                "content": {
                  "text": "Добро пожаловать",
                  "level": 1,
                  "align": "center"
                },
                "effectiveContent": {
                  "text": "Добро пожаловать",
                  "level": 1,
                  "align": "center"
                },
                "position": 0,
                "parent_block_id": "column-1",
                "slot": null,
                "depth": 2,
                "isInstanceRoot": false,
                "children": []
              }
            ]
          },
          {
            "id": "instance-1",
            "block_type": "reusable_instance",
            "content": {},
            "effectiveContent": {
              "title": "Hero Секция",
              "subtitle": "Персонализированное приветствие",
              "backgroundColor": "#007bff"
            },
            "position": 1,
            "parent_block_id": "section-1",
            "slot": "column2",
            "depth": 1,
            "isInstanceRoot": true,
            "instanceId": "instance-uuid-123",
            "children": [
              {
                "id": "hero-title",
                "block_type": "heading",
                "content": {
                  "text": "Hero Секция",
                  "level": 1
                },
                "effectiveContent": {
                  "text": "Hero Секция",
                  "level": 1
                },
                "position": 0,
                "parent_block_id": "instance-1",
                "slot": null,
                "depth": 2,
                "isInstanceRoot": false,
                "children": []
              }
            ]
          }
        ]
      }
    ],
    "instances": [
      {
        "id": "instance-uuid-123",
        "reusableBlockId": "hero-template-1",
        "pageIdentifier": "homepage",
        "overrides": {
          "hero-title": {
            "text": "Персонализированное приветствие"
          },
          "hero-container": {
            "backgroundColor": "#007bff"
          }
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "reusableBlocks": [
      {
        "id": "hero-template-1",
        "name": "Hero Section",
        "category": "sections",
        "version": 2
      }
    ]
  },
  "meta": {
    "totalBlocks": 5,
    "maxDepth": 2,
    "hasInstances": true,
    "generatedAt": "2024-01-15T10:35:00Z"
  }
}
```

**Обработка ошибок**:
```json
// 404 Not Found
{
  "success": false,
  "error": {
    "code": "PAGE_NOT_FOUND",
    "message": "Страница с идентификатором 'nonexistent' не найдена"
  }
}

// 403 Forbidden
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "Недостаточно прав для просмотра черновиков"
  }
}
```

### POST /api/pages/:pageIdentifier/blocks

**Назначение**: Создание нового блока в иерархии

**Метод**: `POST`

**Тело запроса**:
```json
{
  "block_type": "heading",
  "content": {
    "text": "Новый заголовок",
    "level": 2,
    "align": "left"
  },
  "position": 0,
  "parent_block_id": "container-uuid",
  "slot": "column1",
  "metadata": {
    "customClass": "highlight"
  }
}
```

**Валидация**:
- `block_type`: Обязательно, должен существовать в реестре блоков
- `parent_block_id`: Опционально, должен ссылаться на существующий блок
- `slot`: Опционально, должен быть разрешен для родительского блока
- `position`: Опционально, по умолчанию 0

### PUT /api/blocks/:blockId

**Назначение**: Обновление существующего блока

**Метод**: `PUT`

**Тело запроса**:
```json
{
  "content": {
    "text": "Обновленный заголовок"
  },
  "position": 1,
  "metadata": {
    "updatedBy": "user-123"
  }
}
```

### DELETE /api/blocks/:blockId

**Назначение**: Удаление блока и всех его дочерних элементов

**Метод**: `DELETE`

**Особенности**:
- Каскадное удаление всех дочерних блоков
- Проверка зависимостей (экземпляры, другие ссылки)
- Создание точки восстановления перед удалением

---

## 🆕 Новые Эндпоинты для Переиспользуемых Блоков

### POST /api/reusable-blocks

**Назначение**: Создание нового переиспользуемого блока из существующих блоков

**Метод**: `POST`

**Тело запроса**:
```json
{
  "name": "Hero Section Template",
  "description": "Шаблон hero-секции с заголовком и кнопкой",
  "category": "sections",
  "tags": ["hero", "landing", "cta"],
  "sourceBlocks": [
    "block-uuid-1",
    "block-uuid-2",
    "block-uuid-3"
  ],
  "rootBlockId": "block-uuid-1",
  "previewData": {
    "title": "Hero Section",
    "subtitle": "Your amazing subtitle"
  }
}
```

**Процесс создания**:
1. Валидация исходных блоков
2. Создание snapshot дерева блоков
3. Генерация preview изображения
4. Сохранение в базу данных
5. Индексация для поиска

**Пример ответа (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": "reusable-uuid-123",
    "name": "Hero Section Template",
    "version": 1,
    "content": {
      "rootBlockId": "block-uuid-1",
      "blocks": [
        {
          "id": "block-uuid-1",
          "block_type": "container",
          "content": { "layout": "vertical" },
          "children": ["block-uuid-2"]
        },
        {
          "id": "block-uuid-2",
          "block_type": "heading",
          "content": { "text": "Hero Title", "level": 1 }
        }
      ]
    },
    "createdAt": "2024-01-15T11:00:00Z"
  }
}
```

### GET /api/reusable-blocks

**Назначение**: Получение списка всех доступных переиспользуемых блоков

**Метод**: `GET`

**Query параметры**:
- `category` (string, optional): Фильтр по категории
- `search` (string, optional): Поиск по имени и описанию
- `tags` (string[], optional): Фильтр по тегам
- `limit` (number, optional): Лимит результатов (по умолчанию 50)
- `offset` (number, optional): Смещение для пагинации
- `sortBy` (string, optional): Сортировка (`name`, `created_at`, `usage_count`)
- `sortOrder` (string, optional): Порядок сортировки (`asc`, `desc`)

**Пример запроса**:
```bash
GET /api/reusable-blocks?category=sections&search=hero&limit=10&sortBy=usage_count&sortOrder=desc
```

**Пример ответа**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "reusable-uuid-123",
        "name": "Hero Section",
        "description": "Адаптивная hero-секция",
        "category": "sections",
        "tags": ["hero", "landing"],
        "usageCount": 25,
        "version": 3,
        "previewImageUrl": "/previews/reusable-uuid-123.png",
        "createdBy": "user-123",
        "createdAt": "2024-01-10T09:00:00Z",
        "updatedAt": "2024-01-14T16:30:00Z"
      }
    ],
    "total": 1,
    "hasMore": false
  },
  "meta": {
    "categories": ["sections", "components", "layouts"],
    "totalCount": 45
  }
}
```

### POST /api/reusable-blocks/:reusableBlockId/instantiate

**Назначение**: Создание экземпляра переиспользуемого блока на странице

**Метод**: `POST`

**Тело запроса**:
```json
{
  "pageIdentifier": "homepage",
  "parentBlockId": "container-uuid",
  "slot": "column1",
  "position": 0,
  "overrides": {
    "heading-block-id": {
      "text": "Персонализированный заголовок"
    },
    "button-block-id": {
      "text": "Нажми меня",
      "link": "/custom-link"
    }
  }
}
```

**Процесс инстанцирования**:
1. Получение актуальной версии reusable блока
2. Клонирование дерева блоков с новыми ID
3. Применение overrides
4. Сохранение в базу данных
5. Возврат дерева для рендеринга

**Пример ответа**:
```json
{
  "success": true,
  "data": {
    "instanceId": "instance-uuid-456",
    "blocks": [
      {
        "id": "new-block-1",
        "block_type": "container",
        "content": { "layout": "vertical" },
        "effectiveContent": { "layout": "vertical" },
        "parent_block_id": "container-uuid",
        "slot": "column1",
        "position": 0,
        "isInstanceRoot": true,
        "instanceId": "instance-uuid-456",
        "children": [
          {
            "id": "new-block-2",
            "block_type": "heading",
            "content": { "text": "Hero Title" },
            "effectiveContent": { "text": "Персонализированный заголовок" },
            "parent_block_id": "new-block-1",
            "slot": null,
            "position": 0,
            "isInstanceRoot": false
          }
        ]
      }
    ]
  }
}
```

### PUT /api/block-instances/:instanceId/overrides

**Назначение**: Обновление переопределений для экземпляра

**Метод**: `PUT`

**Тело запроса**:
```json
{
  "overrides": {
    "block-id-1": {
      "text": "Новый текст",
      "style.color": "#ff0000"
    },
    "block-id-2": {
      "imageUrl": "/new-image.jpg"
    }
  },
  "merge": true  // true - слить с существующими, false - заменить
}
```

### GET /api/reusable-blocks/:reusableBlockId/versions

**Назначение**: Получение истории версий переиспользуемого блока

**Метод**: `GET`

**Пример ответа**:
```json
{
  "success": true,
  "data": {
    "reusableBlockId": "reusable-uuid-123",
    "versions": [
      {
        "version": 3,
        "createdAt": "2024-01-14T16:30:00Z",
        "createdBy": "user-123",
        "comment": "Исправлена адаптивность",
        "changes": ["Updated button styles", "Added responsive breakpoints"]
      },
      {
        "version": 2,
        "createdAt": "2024-01-12T14:20:00Z",
        "createdBy": "user-456",
        "comment": "Добавлена поддержка темной темы",
        "changes": ["Added dark mode support"]
      }
    ]
  }
}
```

---

## 📝 DTO и Типы Данных

### Core Types

```typescript
// Основные типы данных
export interface BlockNode {
  id: string;
  block_type: string;
  content: BlockContent;
  effectiveContent: BlockContent; // content + overrides
  position: number;
  parent_block_id: string | null;
  slot: string | null;
  depth: number;
  isInstanceRoot: boolean;
  instanceId?: string;
  children: BlockNode[];
  metadata: Record<string, any>;
}

export interface BlockInstance {
  id: string;
  reusableBlockId: string;
  pageIdentifier: string;
  parentBlockId?: string;
  slot?: string;
  position: number;
  overrides: OverrideMap;
  createdAt: string;
  updatedAt: string;
}

export interface ReusableBlock {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  previewImageUrl?: string;
  createdBy: string;
  version: number;
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// Override system types
export interface OverrideMap {
  [blockId: string]: {
    [propertyPath: string]: any;
  };
}

export interface OverrideUpdate {
  overrides: OverrideMap;
  merge?: boolean; // default: true
}
```

### API Request/Response DTOs

```typescript
// Request DTOs
export interface CreateBlockRequest {
  block_type: string;
  content?: BlockContent;
  position?: number;
  parent_block_id?: string;
  slot?: string;
  metadata?: Record<string, any>;
}

export interface UpdateBlockRequest {
  content?: BlockContent;
  position?: number;
  parent_block_id?: string;
  slot?: string;
  metadata?: Record<string, any>;
}

export interface CreateReusableBlockRequest {
  name: string;
  description?: string;
  category: string;
  tags?: string[];
  sourceBlocks: string[];
  rootBlockId: string;
  previewData?: Record<string, any>;
}

export interface InstantiateBlockRequest {
  pageIdentifier: string;
  parentBlockId?: string;
  slot?: string;
  position?: number;
  overrides?: OverrideMap;
}

// Response DTOs
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    [key: string]: any;
  };
}

export interface PageBlocksResponse {
  pageIdentifier: string;
  blocks: BlockNode[];
  instances: BlockInstance[];
  reusableBlocks: ReusableBlockSummary[];
}

export interface ReusableBlocksListResponse {
  items: ReusableBlock[];
  total: number;
  hasMore: boolean;
}

export interface BlockOperationResponse {
  blockId: string;
  affectedBlocks?: string[]; // для операций затрагивающих дерево
  instanceId?: string;
}
```

### Validation Schemas

```typescript
import { z } from 'zod';

// Block validation
export const BlockContentSchema = z.record(z.any());

export const CreateBlockSchema = z.object({
  block_type: z.string().min(1, 'Block type is required'),
  content: BlockContentSchema.optional(),
  position: z.number().min(0).optional(),
  parent_block_id: z.string().uuid().optional(),
  slot: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

// Reusable block validation
export const CreateReusableBlockSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional(),
  sourceBlocks: z.array(z.string().uuid()).min(1, 'At least one source block required'),
  rootBlockId: z.string().uuid(),
  previewData: z.record(z.any()).optional(),
});

// Override validation
export const OverrideMapSchema = z.record(
  z.string().uuid(),
  z.record(z.string(), z.any())
);

export const UpdateOverridesSchema = z.object({
  overrides: OverrideMapSchema,
  merge: z.boolean().optional().default(true),
});
```

---

## 🔄 Логика Hydration Экземпляров

### Процесс Hydration

```typescript
interface HydrationContext {
  pageIdentifier: string;
  userOverrides: OverrideMap;
  masterBlocks: Map<string, MasterBlock>;
  instanceCache: Map<string, BlockInstance>;
}

class BlockHydrator {
  async hydratePageBlocks(pageIdentifier: string): Promise<PageBlockTree> {
    // 1. Получение всех блоков страницы
    const rawBlocks = await this.getRawBlocks(pageIdentifier);

    // 2. Получение всех экземпляров на странице
    const instances = await this.getBlockInstances(pageIdentifier);

    // 3. Получение мастер-блоков для экземпляров
    const masterBlocks = await this.getMasterBlocks(instances);

    // 4. Построение дерева с применением overrides
    const tree = await this.buildBlockTree(rawBlocks, instances, masterBlocks);

    return tree;
  }

  private async buildBlockTree(
    rawBlocks: RawBlock[],
    instances: BlockInstance[],
    masterBlocks: Map<string, MasterBlock>
  ): Promise<BlockNode[]> {
    const blockMap = new Map<string, RawBlock>();
    const instanceMap = new Map<string, BlockInstance>();

    // Создание мап для быстрого доступа
    rawBlocks.forEach(block => blockMap.set(block.id, block));
    instances.forEach(instance => instanceMap.set(instance.id, instance));

    // Рекурсивное построение дерева
    const buildNode = (blockId: string, depth: number): BlockNode => {
      const block = blockMap.get(blockId);
      if (!block) throw new Error(`Block ${blockId} not found`);

      const instance = block.instance_id ? instanceMap.get(block.instance_id) : null;
      const masterBlock = instance ? masterBlocks.get(instance.reusableBlockId) : null;

      // Вычисление effective content
      const effectiveContent = this.computeEffectiveContent(
        block.content,
        instance?.overrides || {},
        masterBlock
      );

      // Рекурсивное построение дочерних элементов
      const children = rawBlocks
        .filter(b => b.parent_block_id === blockId)
        .sort((a, b) => a.position - b.position)
        .map(child => buildNode(child.id, depth + 1));

      return {
        id: block.id,
        block_type: block.block_type,
        content: block.content,
        effectiveContent,
        position: block.position,
        parent_block_id: block.parent_block_id,
        slot: block.slot,
        depth,
        isInstanceRoot: block.is_instance_root,
        instanceId: block.instance_id,
        children,
        metadata: block.metadata
      };
    };

    // Построение корневых узлов
    return rawBlocks
      .filter(block => !block.parent_block_id)
      .sort((a, b) => a.position - b.position)
      .map(block => buildNode(block.id, 0));
  }

  private computeEffectiveContent(
    originalContent: any,
    overrides: OverrideMap,
    masterBlock?: MasterBlock
  ): any {
    let content = { ...originalContent };

    // Применение overrides для этого блока
    const blockOverrides = overrides[content.id] || {};
    content = this.applyOverrides(content, blockOverrides);

    return content;
  }

  private applyOverrides(content: any, overrides: Record<string, any>): any {
    const result = { ...content };

    for (const [path, value] of Object.entries(overrides)) {
      this.setNestedProperty(result, path, value);
    }

    return result;
  }

  private setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current) || typeof current[keys[i]] !== 'object') {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
  }
}
```

### Оптимизации Hydration

1. **Кеширование Master Blocks**: Мастер-блоки кешируются на уровне приложения
2. **Ленивая Загрузка**: Дочерние блоки загружаются только при необходимости
3. **Инкрементные Обновления**: Пересчет только измененных частей дерева
4. **Батчинг Запросов**: Группировка запросов к базе данных

---

## ⚠️ Обработка Ошибок

### Стандартизированная Обработка Ошибок

```typescript
export enum ErrorCode {
  // Общие ошибки
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',

  // Специфические для блоков
  BLOCK_NOT_FOUND = 'BLOCK_NOT_FOUND',
  INVALID_BLOCK_TYPE = 'INVALID_BLOCK_TYPE',
  INVALID_PARENT_BLOCK = 'INVALID_PARENT_BLOCK',
  INVALID_SLOT = 'INVALID_SLOT',
  MAX_DEPTH_EXCEEDED = 'MAX_DEPTH_EXCEEDED',

  // Специфические для reusable блоков
  REUSABLE_BLOCK_NOT_FOUND = 'REUSABLE_BLOCK_NOT_FOUND',
  INSTANCE_NOT_FOUND = 'INSTANCE_NOT_FOUND',
  INVALID_OVERRIDE = 'INVALID_OVERRIDE',
  VERSION_CONFLICT = 'VERSION_CONFLICT'
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: any;
  field?: string;
  timestamp: string;
}

// Middleware для обработки ошибок
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        details: err.details,
        timestamp: new Date().toISOString()
      }
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      success: false,
      error: {
        code: err.code || ErrorCode.NOT_FOUND,
        message: err.message,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Логирование внутренних ошибок
  console.error('Unhandled error:', err);

  return res.status(500).json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    }
  });
}
```

### Специфические Сценарии Ошибок

```typescript
// Валидация иерархии блоков
export class BlockHierarchyError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public blockId: string,
    public parentBlockId?: string
  ) {
    super(message);
    this.name = 'BlockHierarchyError';
  }
}

// Обработка конфликтов версий
export class VersionConflictError extends Error {
  constructor(
    message: string,
    public expectedVersion: number,
    public actualVersion: number
  ) {
    super(message);
    this.name = 'VersionConflictError';
  }
}

// Валидация overrides
export function validateOverrides(
  overrides: OverrideMap,
  blockStructure: BlockNode[]
): ValidationResult {
  const errors: ValidationError[] = [];

  for (const [blockId, blockOverrides] of Object.entries(overrides)) {
    const block = blockStructure.find(b => b.id === blockId);
    if (!block) {
      errors.push({
        field: `overrides.${blockId}`,
        message: `Block ${blockId} not found in structure`
      });
      continue;
    }

    // Валидация по схеме блока
    const blockSpec = getBlockSpec(block.block_type);
    if (blockSpec?.schema) {
      try {
        const effectiveContent = applyOverrides(block.content, blockOverrides);
        blockSpec.schema.parse(effectiveContent);
      } catch (err) {
        errors.push({
          field: `overrides.${blockId}`,
          message: `Invalid override: ${err.message}`
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
```

---

## 🔐 Аутентификация и Авторизация

### Уровни Доступа

```typescript
export enum Permission {
  // Просмотр
  VIEW_PUBLISHED = 'view:published',
  VIEW_DRAFTS = 'view:drafts',

  // Редактирование блоков
  EDIT_BLOCKS = 'edit:blocks',
  CREATE_BLOCKS = 'create:blocks',
  DELETE_BLOCKS = 'delete:blocks',

  // Работа с reusable блоками
  CREATE_REUSABLE = 'create:reusable',
  EDIT_REUSABLE = 'edit:reusable',
  DELETE_REUSABLE = 'delete:reusable',
  INSTANTIATE_REUSABLE = 'instantiate:reusable',

  // Управление
  MANAGE_PERMISSIONS = 'manage:permissions',
  MANAGE_TEMPLATES = 'manage:templates'
}

export interface UserContext {
  userId: string;
  roles: string[];
  permissions: Permission[];
  metadata: Record<string, any>;
}
```

### Middleware для Авторизации

```typescript
export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userContext = getUserContext(req);

    if (!userContext.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: {
          code: ErrorCode.FORBIDDEN,
          message: `Missing required permission: ${permission}`
        }
      });
    }

    next();
  };
}

// Применение middleware к роутам
router.get('/api/pages/:pageIdentifier/blocks',
  authenticate,
  requirePermission(Permission.VIEW_PUBLISHED),
  getPageBlocks
);

router.post('/api/reusable-blocks',
  authenticate,
  requirePermission(Permission.CREATE_REUSABLE),
  createReusableBlock
);
```

---

## ⚡ Производительность и Кеширование

### Стратегии Кеширования

```typescript
interface CacheConfig {
  ttl: {
    pageBlocks: number;      // 5 минут
    reusableBlocks: number;  // 10 минут
    blockInstances: number;  // 5 минут
  };
  maxSize: {
    pageBlocks: number;      // 100 страниц
    reusableBlocks: number;  // 500 блоков
  };
}

class BlockCacheManager {
  private cache: Cache;

  async getPageBlocks(pageIdentifier: string, status: string): Promise<PageBlockTree | null> {
    const cacheKey = `page_blocks:${pageIdentifier}:${status}`;
    return await this.cache.get<PageBlockTree>(cacheKey);
  }

  async setPageBlocks(pageIdentifier: string, status: string, data: PageBlockTree): Promise<void> {
    const cacheKey = `page_blocks:${pageIdentifier}:${status}`;
    await this.cache.set(cacheKey, data, { ttl: this.config.ttl.pageBlocks });
  }

  async invalidatePageBlocks(pageIdentifier: string): Promise<void> {
    const patterns = [
      `page_blocks:${pageIdentifier}:*`,
      `page_blocks_tree:${pageIdentifier}:*`
    ];

    for (const pattern of patterns) {
      await this.cache.invalidatePattern(pattern);
    }
  }

  async invalidateReusableBlock(reusableBlockId: string): Promise<void> {
    // Инвалидация всех страниц, использующих этот блок
    const instancePages = await this.getPagesUsingReusableBlock(reusableBlockId);

    for (const pageId of instancePages) {
      await this.invalidatePageBlocks(pageId);
    }

    // Инвалидация самого reusable блока
    await this.cache.invalidatePattern(`reusable_block:${reusableBlockId}:*`);
  }
}
```

### Оптимизации Базы Данных

```sql
-- Оптимизированные запросы для дерева блоков
CREATE OR REPLACE FUNCTION get_page_block_tree_optimized(page_identifier text)
RETURNS TABLE(
  id uuid,
  block_type text,
  content jsonb,
  effective_content jsonb,
  position integer,
  parent_block_id uuid,
  slot text,
  depth integer,
  is_instance_root boolean,
  instance_id uuid,
  path uuid[],
  tree_order text
) AS $$
WITH RECURSIVE block_tree AS (
  -- Корневые блоки
  SELECT
    lb.id,
    lb.block_type,
    lb.content,
    CASE
      WHEN bi.id IS NOT NULL THEN jsonb_deep_merge(lb.content, bi.overrides)
      ELSE lb.content
    END as effective_content,
    lb.position,
    lb.parent_block_id,
    lb.slot,
    lb.depth,
    lb.is_instance_root,
    lb.instance_id,
    ARRAY[lb.id] as path,
    lb.position::text as tree_order
  FROM layout_blocks lb
  LEFT JOIN block_instances bi ON lb.instance_id = bi.id
  WHERE lb.page_identifier = $1 AND lb.parent_block_id IS NULL

  UNION ALL

  -- Дочерние блоки
  SELECT
    lb.id,
    lb.block_type,
    lb.content,
    CASE
      WHEN bi.id IS NOT NULL THEN jsonb_deep_merge(lb.content, bi.overrides)
      ELSE lb.content
    END as effective_content,
    lb.position,
    lb.parent_block_id,
    lb.slot,
    lb.depth,
    lb.is_instance_root,
    lb.instance_id,
    bt.path || lb.id,
    bt.tree_order || '.' || lb.position::text
  FROM layout_blocks lb
  INNER JOIN block_tree bt ON lb.parent_block_id = bt.id
  LEFT JOIN block_instances bi ON lb.instance_id = bi.id
)
SELECT * FROM block_tree
ORDER BY tree_order;
$$ LANGUAGE sql STABLE;
```

### Мониторинг Производительности

```typescript
interface PerformanceMetrics {
  queryTime: number;
  cacheHit: boolean;
  blocksProcessed: number;
  instancesHydrated: number;
  memoryUsage: number;
  timestamp: Date;
}

class PerformanceMonitor {
  async measureBlockOperation<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    try {
      const result = await fn();
      const endTime = Date.now();
      const endMemory = process.memoryUsage();

      this.recordMetrics({
        operation,
        duration: endTime - startTime,
        memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
        success: true
      });

      return result;
    } catch (error) {
      this.recordMetrics({
        operation,
        duration: Date.now() - startTime,
        success: false,
        error: error.message
      });
      throw error;
    }
  }
}
```

---

## 🎯 Заключение

Новая спецификация API предоставляет:

1. **Полную поддержку иерархических блоков** с оптимизированным деревом
2. **Мощную систему переиспользуемых компонентов** с гибкими overrides
3. **Высокую производительность** благодаря кешированию и оптимизациям БД
4. **Надежную обработку ошибок** со стандартизированными кодами
5. **Гибкую систему авторизации** с granular permissions
6. **Комплексный мониторинг** производительности и здоровья системы

API разработан с учетом масштабируемости, поддерживает постепенную миграцию и обеспечивает обратную совместимость с существующими клиентами.
