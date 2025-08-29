# 🧩 API Переиспользуемых Блоков - Руководство по Использованию

## 📋 Обзор

Система переиспользуемых блоков позволяет создавать мастер-шаблоны блоков и их экземпляры на разных страницах с возможностью индивидуальной настройки (overrides).

## 🚀 Основные Эндпоинты

### 1. Создание Переиспользуемого Блока

**POST** `/api/reusable-blocks`

Создает новый переиспользуемый блок из существующих блоков страницы.

```bash
curl -X POST http://localhost:3001/api/reusable-blocks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Hero Section Template",
    "description": "Адаптивная hero-секция с заголовком и кнопкой",
    "category": "sections",
    "tags": ["hero", "landing", "cta"],
    "sourceBlockIds": ["block-uuid-1", "block-uuid-2"],
    "rootBlockId": "block-uuid-1"
  }'
```

**Ответ (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "reusable-uuid-123",
    "name": "Hero Section Template",
    "version": 1,
    "content": {
      "rootBlockId": "block-uuid-1",
      "blocks": [...]
    },
    "createdAt": "2024-01-15T11:00:00Z"
  }
}
```

### 2. Получение Списка Переиспользуемых Блоков

**GET** `/api/reusable-blocks`

Возвращает список всех доступных переиспользуемых блоков с поддержкой фильтрации и пагинации.

```bash
# Получить все блоки
curl http://localhost:3001/api/reusable-blocks

# С фильтрами
curl "http://localhost:3001/api/reusable-blocks?category=sections&search=hero&limit=10"
```

**Параметры запроса:**
- `category` - Фильтр по категории
- `search` - Поиск по имени и описанию
- `tags` - Фильтр по тегам (через запятую)
- `limit` - Количество результатов (по умолчанию 50)
- `offset` - Смещение для пагинации
- `sortBy` - Сортировка (`name`, `created_at`, `usage_count`)
- `sortOrder` - Порядок (`asc`, `desc`)

### 3. Создание Экземпляра Блока

**POST** `/api/reusable-blocks/:reusableBlockId/instantiate`

Создает экземпляр переиспользуемого блока на указанной странице.

```bash
curl -X POST http://localhost:3001/api/reusable-blocks/reusable-uuid-123/instantiate \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

**Ответ (201 Created):**
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
        "instanceId": "instance-uuid-456"
      }
    ]
  }
}
```

### 4. Обновление Overrides Экземпляра

**PUT** `/api/reusable-blocks/instances/:instanceId/overrides`

Обновляет переопределения для конкретного экземпляра.

```bash
curl -X PUT http://localhost:3001/api/reusable-blocks/instances/instance-uuid-456/overrides \
  -H "Content-Type: application/json" \
  -d '{
    "overrides": {
      "heading-block-id": {
        "text": "Обновленный заголовок"
      }
    }
  }'
```

### 5. Удаление Переиспользуемого Блока

**DELETE** `/api/reusable-blocks/:id`

Удаляет переиспользуемый блок и все его экземпляры.

```bash
curl -X DELETE http://localhost:3001/api/reusable-blocks/reusable-uuid-123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔧 Дополнительные Эндпоинты

### Получение Конкретного Блока

**GET** `/api/reusable-blocks/:id`

```bash
curl http://localhost:3001/api/reusable-blocks/reusable-uuid-123
```

### Обновление Метаданных

**PUT** `/api/reusable-blocks/:id`

```bash
curl -X PUT http://localhost:3001/api/reusable-blocks/reusable-uuid-123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Updated Hero Section",
    "description": "Обновленное описание",
    "category": "components"
  }'
```

### Получение Списка Категорий

**GET** `/api/reusable-blocks/categories/list`

```bash
curl http://localhost:3001/api/reusable-blocks/categories/list
```

## 📊 Структура Данных

### ReusableBlock
```typescript
interface ReusableBlock {
  id: string
  name: string
  description?: string
  category: string
  tags?: string[]
  preview_image_url?: string
  created_by?: string
  created_at: string
  updated_at: string
  version: number
  usage_count?: number
}
```

### BlockInstance
```typescript
interface BlockInstance {
  id: string
  reusable_block_id: string
  page_id: number
  parent_block_id?: string
  slot?: string
  position: number
  overrides: Record<string, any>
  created_at: string
  updated_at: string
}
```

## 🔐 Аутентификация и Авторизация

- Создание и удаление переиспользуемых блоков требует прав администратора (`isAdmin` middleware)
- Чтение доступно всем аутентифицированным пользователям
- Создание экземпляров доступно всем пользователям

## ⚠️ Важные Замечания

1. **Каскадное удаление**: При удалении переиспользуемого блока автоматически удаляются все его экземпляры и связанные блоки
2. **Валидация**: Система проверяет существование исходных блоков перед созданием шаблона
3. **Генерация ID**: Все новые блоки получают уникальные UUID
4. **Наследование связей**: При клонировании сохраняются все иерархические связи между блоками
5. **Overrides**: Переопределения применяются только к контенту блоков, структура остается неизменной

## 🧪 Тестирование API

### Создание тестового блока:
```bash
# 1. Создать переиспользуемый блок
curl -X POST http://localhost:3001/api/reusable-blocks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Block",
    "sourceBlockIds": ["existing-block-id"],
    "rootBlockId": "existing-block-id"
  }'

# 2. Создать экземпляр
curl -X POST http://localhost:3001/api/reusable-blocks/{id}/instantiate \
  -H "Content-Type: application/json" \
  -d '{
    "pageIdentifier": "test-page",
    "overrides": {}
  }'
```

## 🔄 Следующие Шаги

После реализации бэкенда можно приступать к:

1. **Фронтенд UI** для управления переиспользуемыми блоками
2. **Интеграция с существующим редактором** блоков
3. **Система превью** для шаблонов
4. **Управление версиями** контента блоков

API готов к использованию и полностью соответствует спецификации из документа 03_Backend_API_Specification.md.
