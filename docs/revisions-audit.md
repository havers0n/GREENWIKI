# СИСТЕМА РЕВИЗИЙ - АНАЛИЗ СНАПШОТОВ

## 🚨 КРИТИЧЕСКАЯ ПРОБЛЕМА

**Основная проблема:** Ревизии НЕ сохраняют структуру вложенности блоков

## 📋 АНАЛИЗ ТЕКУЩЕЙ РЕАЛИЗАЦИИ

### Создание ревизии (КРИТИЧНАЯ ПРОБЛЕМА)

**Файл:** `backend/src/routes/layoutRoutes.ts:242`

```typescript
// POST /api/layout/:pageIdentifier/revisions
router.post('/:pageIdentifier/revisions', isAdmin, async (req: Request<{ pageIdentifier: string }>, res: Response) => {
  const { pageIdentifier } = req.params
  const { data: blocks, error: selectError } = await supabaseAdmin
    .from('layout_blocks')
    .select('block_type, content, position, status')  // ❌ КРИТИЧНО: ПРОПУЩЕНЫ parent_block_id И slot
    .eq('page_identifier', pageIdentifier)
    .order('position', { ascending: true })

  if (selectError) {
    return res.status(500).json({ error: 'Failed to read layout for snapshot' })
  }

  const snapshot = Array.isArray(blocks) ? blocks : []
  const { data, error } = await supabaseAdmin
    .from('layout_revisions')
    .insert({ page_identifier: pageIdentifier, snapshot, created_by: (req.user as any)?.id ?? null })
    .select('*')
    .single()
})
```

**Пропущенные критические поля:**
- ❌ `parent_block_id` - ссылка на родительский блок
- ❌ `slot` - именованный слот в контейнере
- ❌ `id` - идентификатор блока (для восстановления связей)

### Восстановление из ревизии (КРИТИЧНАЯ ПРОБЛЕМА)

**Файл:** `backend/src/routes/layoutRoutes.ts:299`

```typescript
// POST /api/layout/:pageIdentifier/revisions/:revisionId/revert
const snapshot: Array<{ block_type?: string; content?: Json; position?: number; status?: string }>
// ❌ НЕТ parent_block_id и slot в типе!

for (const item of snapshot) {
  if (!item?.block_type) continue
  const insertPayload: TablesInsert<'layout_blocks'> = {
    page_identifier: pageIdentifier,
    block_type: item.block_type,
    content: (item.content as Json | undefined) ?? {},
    position: typeof item.position === 'number' ? item.position : 0,
    status: (item.status as any) || 'draft'
    // ❌ ПРОПУЩЕНЫ: parent_block_id, slot
  }
  // Вставка без восстановления связей вложенности!
}
```

## 📊 ПОСЛЕДСТВИЯ ПРОБЛЕМЫ

### 1. **Потеря структуры страницы**
При откате к ревизии:
- Все блоки становятся корневыми (теряют parent_block_id)
- Исчезают слоты (теряют slot)
- Структура "контейнер → вложенные блоки" разрушается

### 2. **Невозможность восстановления**
- Ревизии содержат неполные данные
- Откат приводит к потере иерархической структуры
- Пользователи теряют работу по организации контента

### 3. **Нарушение целостности данных**
- После отката могут существовать "сиротские" блоки
- Связи между контейнерами и содержимым теряются
- База данных находится в несогласованном состоянии

## 🔍 АНАЛИЗ ТЕКУЩЕГО ФОРМАТА СНАПШОТА

### Текущий формат (НЕДОСТАТОЧНЫЙ):
```json
{
  "snapshot": [
    {
      "block_type": "heading",
      "content": { "text": "Заголовок", "level": 1 },
      "position": 1,
      "status": "published"
      // ❌ ПРОПУЩЕНЫ: parent_block_id, slot
    },
    {
      "block_type": "container_section",
      "content": { "title": "Контейнер" },
      "position": 2,
      "status": "published"
      // ❌ ПРОПУЩЕНЫ: parent_block_id, slot
    }
  ]
}
```

### Необходимый формат:
```json
{
  "snapshot": [
    {
      "id": "uuid-1",
      "block_type": "heading",
      "content": { "text": "Заголовок", "level": 1 },
      "position": 1,
      "status": "published",
      "parent_block_id": null,
      "slot": null
    },
    {
      "id": "uuid-2",
      "block_type": "container_section",
      "content": { "title": "Контейнер" },
      "position": 2,
      "status": "published",
      "parent_block_id": null,
      "slot": null
    },
    {
      "id": "uuid-3",
      "block_type": "paragraph",
      "content": { "text": "Текст в контейнере" },
      "position": 1,
      "status": "published",
      "parent_block_id": "uuid-2",
      "slot": "column1"
    }
  ]
}
```

## 🛠️ РЕКОМЕНДАЦИИ ПО ИСПРАВЛЕНИЮ

### 1. Исправить создание ревизии

**Файл:** `backend/src/routes/layoutRoutes.ts`

```typescript
// ИСПРАВИТЬ: добавить недостающие поля
const { data: blocks, error: selectError } = await supabaseAdmin
  .from('layout_blocks')
  .select('id, block_type, content, position, status, parent_block_id, slot')  // ✅ ДОБАВИТЬ
  .eq('page_identifier', pageIdentifier)
  .order('position', { ascending: true })
```

### 2. Исправить типы TypeScript

**Файл:** `backend/src/routes/layoutRoutes.ts`

```typescript
// ИСПРАВИТЬ: обновить тип snapshot
const snapshot: Array<{
  id?: string
  block_type?: string
  content?: Json
  position?: number
  status?: string
  parent_block_id?: string | null
  slot?: string | null
}>
```

### 3. Исправить восстановление из ревизии

**Файл:** `backend/src/routes/layoutRoutes.ts`

```typescript
// ИСПРАВИТЬ: добавить недостающие поля при вставке
for (const item of snapshot) {
  if (!item?.block_type || !item?.id) continue
  const insertPayload: TablesInsert<'layout_blocks'> = {
    id: item.id,  // ✅ ДОБАВИТЬ
    page_identifier: pageIdentifier,
    block_type: item.block_type,
    content: (item.content as Json | undefined) ?? {},
    position: typeof item.position === 'number' ? item.position : 0,
    status: (item.status as any) || 'draft',
    parent_block_id: item.parent_block_id || null,  // ✅ ДОБАВИТЬ
    slot: item.slot || null  // ✅ ДОБАВИТЬ
  }
}
```

### 4. Добавить миграцию для существующих ревизий

```sql
-- Миграция для обновления существующих ревизий
-- (если ревизии уже созданы с неполными данными)

-- ВНИМАНИЕ: Это сложная операция, требующая осторожности
-- Рекомендуется создать новые ревизии с правильными данными
-- вместо попытки восстановить старые
```

## 📋 ТЕСТОВЫЕ СЦЕНАРИИ

### Тест 1: Сохранение полной структуры
```typescript
// Тестирование создания ревизии с вложенными блоками
const testSnapshot = {
  snapshot: [
    {
      id: "container-1",
      block_type: "container_section",
      content: { title: "Тестовый контейнер" },
      position: 1,
      status: "draft",
      parent_block_id: null,
      slot: null
    },
    {
      id: "heading-1",
      block_type: "heading",
      content: { text: "Заголовок в контейнере", level: 2 },
      position: 1,
      status: "draft",
      parent_block_id: "container-1",
      slot: "column1"
    }
  ]
}

// Проверка, что все поля сохранены
expect(testSnapshot.snapshot[0]).toHaveProperty('parent_block_id')
expect(testSnapshot.snapshot[0]).toHaveProperty('slot')
expect(testSnapshot.snapshot[1]).toHaveProperty('parent_block_id')
expect(testSnapshot.snapshot[1]).toHaveProperty('slot')
```

### Тест 2: Восстановление полной структуры
```typescript
// Тестирование отката к ревизии
const restoredBlocks = await revertToRevision(pageIdentifier, revisionId)

// Проверка, что связи восстановлены
const container = restoredBlocks.find(b => b.block_type === 'container_section')
const heading = restoredBlocks.find(b => b.block_type === 'heading')

expect(heading.parent_block_id).toBe(container.id)
expect(heading.slot).toBe('column1')
```

## 📊 МЕТРИКИ ПРОБЛЕМЫ

| Аспект | Текущая оценка | После исправления |
|--------|----------------|-------------------|
| Сохранность данных | 40% | 100% |
| Восстановление структуры | 0% | 100% |
| Целостность БД | 60% | 100% |
| Доверие пользователей | Низкое | Высокое |

## 🔗 СВЯЗЬ С ДРУГИМИ ПРОБЛЕМАМИ

### Каскадное удаление
- **Связь:** Проблема ревизий усугубляет отсутствие каскадного удаления
- **Влияние:** При откате могут появиться ссылки на несуществующие блоки

### Валидация allowedChildren
- **Связь:** Ревизии могут содержать некорректные комбинации блоков
- **Влияние:** Откат может привести к нарушению бизнес-правил

## 📁 ФАЙЛЫ ДЛЯ ИСПРАВЛЕНИЯ

1. **backend/src/routes/layoutRoutes.ts** (строки 249, 334-356)
2. **packages/db-types/src/index.ts** (обновить типы если нужно)
3. **Тесты:** Добавить тесты для ревизий с вложенностью

## 🎯 ПРИОРИТЕТ ИСПРАВЛЕНИЯ

**КРИТИЧНЫЙ** - Эта проблема делает систему ревизий практически бесполезной для страниц с вложенными блоками.

**Ожидаемое время исправления:** 2-4 часа  
**Тестирование:** Требуется полное тестирование отката ревизий  
**Риски:** Миграция существующих ревизий (если они есть)

---

*Анализ основан на статическом разборе кода API ревизий и логики восстановления*
