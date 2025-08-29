# МОДЕЛЬ ДАННЫХ - ДЕТАЛЬНЫЙ АНАЛИЗ

## 📋 Обзор схемы

**База данных:** Supabase PostgreSQL  
**Основные таблицы:** 6  
**Связи:** 8 основных отношений  
**RLS политика:** Включена для всех таблиц  

## 🗂️ СТРУКТУРА ТАБЛИЦ

### `pages` - Основные страницы
```sql
CREATE TABLE public.pages (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    author_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);
```

**Ключевые поля:**
- `slug` ↔ `layout_blocks.page_identifier` (логическая связь, НЕ foreign key)
- `status` - контроль публикации
- `author_id` - связь с пользователями

**Проблемы:**
- ⚠️ Отсутствует foreign key на `layout_blocks.page_identifier`
- ⚠️ Нет каскадного удаления связанных блоков

### `layout_blocks` - Блоки макета
```sql
CREATE TABLE public.layout_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_identifier TEXT NOT NULL,
    block_type TEXT NOT NULL,
    content JSONB,
    position INTEGER,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    parent_block_id UUID REFERENCES public.layout_blocks(id),
    slot TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);
```

**Ключевые поля для вложенности:**
- `parent_block_id` - рекурсивная ссылка на родителя
- `slot` - именованный слот в контейнере
- `position` - порядок внутри родителя/слота

**Индексы:**
- `idx_layout_blocks_page_identifier` - быстрый поиск по странице
- `idx_layout_blocks_position` - сортировка блоков
- `idx_layout_blocks_parent` - быстрый поиск дочерних блоков

### `layout_revisions` - Ревизии макета
```sql
CREATE TABLE public.layout_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_identifier TEXT NOT NULL,
    snapshot JSONB NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Критическая проблема:**
- ⚠️ `snapshot` сохраняет НЕПОЛНЫЕ данные
- ⚠️ Отсутствуют `parent_block_id` и `slot` в сохранении

### `categories` и `sections` - Навигация
```sql
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon_svg TEXT,
    position INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.sections (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES public.categories(id),
    name TEXT NOT NULL,
    description TEXT,
    icon_svg TEXT,
    external_url TEXT,
    page_id INTEGER REFERENCES public.pages(id),
    position INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `page_templates` - Шаблоны
```sql
CREATE TABLE public.page_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    preview_url TEXT,
    blocks JSONB NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 🔗 СВЯЗИ МЕЖДУ ТАБЛИЦАМИ

### Основные отношения:
1. **pages.slug → layout_blocks.page_identifier** (логическая связь)
2. **layout_blocks.parent_block_id → layout_blocks.id** (самоссылка)
3. **categories.id → sections.category_id** (один-ко-многим)
4. **pages.id → sections.page_id** (один-к-одному)
5. **pages.slug → layout_revisions.page_identifier** (логическая связь)

### Связи с пользователями:
- **profiles.id → pages.author_id**
- **profiles.id → layout_revisions.created_by**
- **profiles.id → page_templates.created_by**

## ⚠️ ВЫЯВЛЕННЫЕ ПРОБЛЕМЫ

### 1. Отсутствие Foreign Key
**Проблема:** `layout_blocks.page_identifier` ссылается на `pages.slug`, но FK не определена
```sql
-- В схеме НЕТ этого ограничения:
ALTER TABLE public.layout_blocks
ADD CONSTRAINT fk_layout_blocks_page_identifier
FOREIGN KEY (page_identifier) REFERENCES public.pages(slug);
```

**Влияние:**
- Нарушение ссылочной целостности
- Возможны блоки для несуществующих страниц

### 2. Отсутствие каскадного удаления
**Проблема:** При удалении страницы не удаляются связанные блоки
```sql
-- Отсутствует ON DELETE CASCADE
-- В результате: орфанные блоки после удаления страницы
```

### 3. Неполное сохранение в ревизиях
**Файл:** `backend/src/routes/layoutRoutes.ts:249`
```typescript
// ПРОБЛЕМА: сохраняются НЕ все поля
const { data: blocks, error: selectError } = await supabaseAdmin
  .from('layout_blocks')
  .select('block_type, content, position, status')  // ПРОПУЩЕНЫ: parent_block_id, slot
```

**Влияние:**
- Невозможно восстановить дерево вложенности из ревизии
- Потеря структуры страницы при откате

## 🔍 АНАЛИЗ ИСПОЛЬЗОВАНИЯ ПОЛЕЙ

### `parent_block_id` и `slot` - использование в коде:

**Чтение:**
```typescript
// layoutRoutes.ts:17,39
.select('id, block_type, content, page_identifier, position, status, parent_block_id, slot')
```

**Запись:**
```typescript
// layoutRoutes.ts:107,113
const allowed: Array<keyof TablesUpdate<'layout_blocks'>> = [
  'parent_block_id',  // ✅ Разрешено обновление
  'slot'              // ✅ Разрешено обновление
]
```

**DnD логика:**
```typescript
// NewLiveEditor/index.tsx:330-356
// ✅ Правильно обрабатывает parent_block_id и slot при перемещении
```

### `page_identifier` - соответствие:

**В API:**
```typescript
// Все роуты правильно используют pageIdentifier как slug страницы
router.get('/:pageIdentifier', ...)
```

**В DnD:**
```typescript
// ✅ Передает pageIdentifier во все операции создания
const payload: TablesInsert<'layout_blocks'> = {
  page_identifier: pageIdentifier,  // ✅
  // ...
}
```

## 📊 СТАТИСТИКА ПОЛЕЙ

| Таблица | Всего полей | Обязательных | Nullable | FK |
|---------|-------------|--------------|----------|----|
| pages | 7 | 4 | 3 | 1 |
| layout_blocks | 10 | 5 | 5 | 1 |
| layout_revisions | 5 | 3 | 2 | 1 |
| categories | 6 | 3 | 3 | 0 |
| sections | 9 | 3 | 6 | 2 |
| page_templates | 7 | 3 | 4 | 1 |

## 🎯 РЕКОМЕНДАЦИИ ПО ИСПРАВЛЕНИЮ

### 1. Добавить Foreign Key ограничение
```sql
ALTER TABLE public.layout_blocks
ADD CONSTRAINT fk_layout_blocks_page_identifier
FOREIGN KEY (page_identifier) REFERENCES public.pages(slug)
ON DELETE CASCADE;
```

### 2. Исправить сохранение ревизий
```typescript
// layoutRoutes.ts:249 - ДОБАВИТЬ parent_block_id, slot
.select('id, block_type, content, position, status, parent_block_id, slot')
```

### 3. Добавить каскадное удаление
```sql
-- Для sections
ALTER TABLE public.sections DROP CONSTRAINT sections_page_id_fkey;
ALTER TABLE public.sections ADD CONSTRAINT sections_page_id_fkey
FOREIGN KEY (page_id) REFERENCES public.pages(id) ON DELETE SET NULL;
```

## 📈 МЕТРИКИ КАЧЕСТВА

- **Степень нормализации:** Высокая (3NF)
- **RLS покрытие:** 100% (все таблицы защищены)
- **Индексы:** Адекватно для основных запросов
- **Типизация:** Полная TypeScript поддержка
- **Документация:** Частичная (некоторые комментарии)

---

*Анализ основан на статическом разборе SQL схемы и TypeScript типов*
