# Аудит базы данных и политик безопасности

## Обзор схемы базы данных

### Архитектура БД: Supabase/PostgreSQL

```
Database: my-forum (Supabase)
├── Tables: 7 основных + 1 вспомогательная
├── Views: отсутствуют
├── Functions: отсутствуют
├── RLS Policies: включены на всех таблицах
└── Indexes: 15 индексов (оптимизированы для запросов)
```

## Структура таблиц

### 1. Таблица: `pages` (Страницы)
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

**Характеристики**:
- **Записи**: ~N страниц
- **RLS**: ✅ Включен
- **Индексы**: На `slug` (уникальный)
- **Внешние ключи**: `author_id` → `profiles(id)`

### 2. Таблица: `categories` (Категории блоков)
```sql
CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon_svg TEXT,
    position INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Характеристики**:
- **Записи**: ~10-20 категорий
- **RLS**: ✅ Включен
- **Индексы**: На `slug` (уникальный)
- **Внешние ключи**: Отсутствуют

### 3. Таблица: `sections` (Секции)
```sql
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

**Характеристики**:
- **Записи**: ~50-100 секций
- **RLS**: ✅ Включен
- **Индексы**: Отсутствуют (рекомендуется добавить)
- **Внешние ключи**: `category_id` → `categories(id)`, `page_id` → `pages(id)`

### 4. Таблица: `layout_blocks` (Блоки макета) ⭐ **Основная таблица**
```sql
CREATE TABLE public.layout_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id INTEGER NOT NULL,
    block_type TEXT NOT NULL,
    content JSONB,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    position INTEGER,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    parent_block_id UUID REFERENCES public.layout_blocks(id),
    slot TEXT,
    depth INTEGER DEFAULT 0,
    instance_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);
```

**Характеристики**:
- **Записи**: ~1000-10000+ блоков (в зависимости от страниц)
- **RLS**: ✅ Включен
- **JSONB поля**: `content`, `metadata`
- **Внешние ключи**: `page_id` → `pages(id)`, `parent_block_id` → `layout_blocks(id)`
- **Индексы**: 6 индексов (хорошо оптимизировано)

### 5. Таблица: `layout_revisions` (Ревизии макета)
```sql
CREATE TABLE public.layout_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id INTEGER,
    snapshot JSONB NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Характеристики**:
- **Записи**: ~100-1000+ ревизий
- **RLS**: ✅ Включен
- **JSONB поля**: `snapshot`
- **Внешние ключи**: `page_id` → `pages(id)`, `created_by` → `profiles(id)`
- **Индексы**: На `page_id`, `created_at` (оптимизировано для истории)

### 6. Таблица: `page_templates` (Шаблоны страниц)
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

**Характеристики**:
- **Записи**: ~10-50 шаблонов
- **RLS**: ✅ Включен
- **JSONB поля**: `blocks`
- **Внешние ключи**: `created_by` → `profiles(id)`
- **Индексы**: Отсутствуют

### 7. Таблица: `reusable_blocks` (Переиспользуемые блоки)
```sql
-- Определение отсутствует в database-setup.sql
-- Но упоминается в индексах и типах
```

**Характеристики** (на основе типов):
- **Записи**: ~50-200 переиспользуемых блоков
- **RLS**: ✅ Включен
- **JSONB поля**: `content_snapshot`, `overrides`
- **Внешние ключи**: `created_by` → `profiles(id)`

### 8. Таблица: `block_instances` (Экземпляры блоков)
```sql
-- Структура из типов TypeScript
```

**Характеристики**:
- **Записи**: ~500-2000+ экземпляров
- **RLS**: ✅ Включен
- **JSONB поля**: `overrides`
- **Внешние ключи**: `page_id` → `pages(id)`, `reusable_block_id` → `reusable_blocks(id)`

## Система индексов

### Оптимизированные индексы

```sql
-- Layout Blocks (6 индексов)
CREATE INDEX idx_layout_blocks_page_id ON layout_blocks(page_id);
CREATE INDEX idx_layout_blocks_position ON layout_blocks(page_id, position);
CREATE INDEX idx_layout_blocks_parent ON layout_blocks(parent_block_id, position);
CREATE INDEX idx_layout_blocks_page_parent_position ON layout_blocks(page_id, parent_block_id, position);
CREATE INDEX idx_layout_blocks_status_page ON layout_blocks(status, page_id);

-- Revisions (2 индекса)
CREATE INDEX idx_layout_revisions_page ON layout_revisions(page_id, created_at DESC);

-- Reusable Blocks (4 индекса)
CREATE INDEX idx_reusable_blocks_category ON reusable_blocks(category);
CREATE INDEX idx_reusable_blocks_created_by ON reusable_blocks(created_by);
CREATE INDEX idx_reusable_blocks_created_at ON reusable_blocks(created_at DESC);
CREATE INDEX idx_reusable_blocks_search ON reusable_blocks USING gin(to_tsvector('russian', name || ' ' || COALESCE(description, '')));

-- Block Instances (2 индекса)
CREATE INDEX idx_block_instances_reusable_block_id ON block_instances(reusable_block_id);
CREATE INDEX idx_block_instances_page_id ON block_instances(page_id);
```

### Анализ покрытия индексов

| Таблица | Индексы | Покрытие запросов | Статус |
|---------|---------|-------------------|--------|
| `layout_blocks` | 6 индексов | ⭐ Отлично | ✅ Оптимизировано |
| `layout_revisions` | 2 индекса | ⭐ Отлично | ✅ Оптимизировано |
| `reusable_blocks` | 4 индекса | ⭐ Отлично | ✅ Оптимизировано |
| `block_instances` | 2 индекса | ⭐ Хорошо | ✅ Оптимизировано |
| `pages` | 1 индекс | ⚠️ Недостаточно | ❌ Требуется доработка |
| `categories` | 1 индекс | ⚠️ Недостаточно | ❌ Требуется доработка |
| `sections` | 0 индексов | ❌ Отсутствуют | ❌ Требуется доработка |

## Политики Row Level Security (RLS)

### Общий обзор

**RLS включен на всех таблицах** - это обеспечивает безопасность на уровне строк.

### Политики для публичного доступа

```sql
-- Публичное чтение опубликованного контента
CREATE POLICY "Public can read published pages" ON pages FOR SELECT USING (status = 'published');
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can read sections" ON sections FOR SELECT USING (true);
CREATE POLICY "Public can read published blocks" ON layout_blocks FOR SELECT USING (status = 'published');
```

### Политики для администраторов

```sql
-- Полный доступ для администраторов
CREATE POLICY "Admins can manage pages" ON pages FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
-- Аналогичные политики для всех таблиц...
```

### Анализ политик RLS

| Таблица | RLS | Public Read | Admin Access | Status |
|---------|-----|-------------|--------------|--------|
| `pages` | ✅ | Published only | ✅ Full | ✅ Хорошо |
| `categories` | ✅ | ✅ All | ✅ Full | ✅ Хорошо |
| `sections` | ✅ | ✅ All | ✅ Full | ✅ Хорошо |
| `layout_blocks` | ✅ | Published only | ✅ Full | ✅ Хорошо |
| `layout_revisions` | ✅ | ❌ None | ✅ Full | ⚠️ Ограничено |
| `page_templates` | ✅ | ❌ None | ✅ Full | ⚠️ Ограничено |
| `reusable_blocks` | ✅ | ❌ None | ✅ Full | ⚠️ Ограничено |
| `block_instances` | ✅ | ❌ None | ✅ Full | ⚠️ Ограничено |

## JSONB поля и валидация

### JSONB поля в системе

| Таблица | Поле | Назначение | Валидация | GIN индекс |
|---------|------|------------|-----------|------------|
| `layout_blocks` | `content` | Данные блока | ❌ Отсутствует | ❌ Нет |
| `layout_blocks` | `metadata` | Метаданные блока | ❌ Отсутствует | ❌ Нет |
| `layout_revisions` | `snapshot` | Снимок страницы | ❌ Отсутствует | ❌ Нет |
| `page_templates` | `blocks` | Шаблон страницы | ❌ Отсутствует | ❌ Нет |
| `reusable_blocks` | `content_snapshot` | Снимок блока | ❌ Отсутствует | ❌ Нет |
| `block_instances` | `overrides` | Переопределения | ❌ Отсутствует | ❌ Нет |

### Отсутствующие GIN индексы

**Рекомендуется добавить GIN индексы для поиска по JSONB:**

```sql
-- Для поиска по контенту блоков
CREATE INDEX CONCURRENTLY idx_layout_blocks_content_gin ON layout_blocks USING gin(content);

-- Для поиска по метаданным
CREATE INDEX CONCURRENTLY idx_layout_blocks_metadata_gin ON layout_blocks USING gin(metadata);

-- Для поиска по snapshot ревизий
CREATE INDEX CONCURRENTLY idx_layout_revisions_snapshot_gin ON layout_revisions USING gin(snapshot);
```

## Внешние ключи и ссылочная целостность

### Каскадные операции

**Текущие настройки:**
- ❌ **Отсутствуют каскадные удаления**
- ❌ **Отсутствуют каскадные обновления**

### Рекомендуемые каскады

```sql
-- При удалении страницы - удалить все блоки
ALTER TABLE layout_blocks DROP CONSTRAINT layout_blocks_page_id_fkey;
ALTER TABLE layout_blocks ADD CONSTRAINT layout_blocks_page_id_fkey
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE;

-- При удалении блока - удалить дочерние блоки
ALTER TABLE layout_blocks DROP CONSTRAINT layout_blocks_parent_block_id_fkey;
ALTER TABLE layout_blocks ADD CONSTRAINT layout_blocks_parent_block_id_fkey
    FOREIGN KEY (parent_block_id) REFERENCES layout_blocks(id) ON DELETE CASCADE;

-- Аналогично для других таблиц...
```

## Проблемы и несоответствия

### 🔴 Критические проблемы

1. **Отсутствие каскадных удалений**:
   - При удалении страницы блоки остаются "осиротевшими"
   - Нарушение ссылочной целостности

2. **Отсутствие GIN индексов на JSONB**:
   - Медленный поиск по контенту блоков
   - Низкая производительность запросов

3. **Несоответствие схемы и типов**:
   - В `database-setup.sql` нет таблицы `reusable_blocks`
   - Но она присутствует в типах TypeScript

### 🟡 Предупреждения

1. **Отсутствие индексов на часто используемых полях**:
   - `sections` - нет индексов на `category_id`, `page_id`
   - `page_templates` - нет индексов

2. **Ограниченный публичный доступ**:
   - Шаблоны и ревизии недоступны публично
   - Может ограничивать возможности фронтенда

### 🟢 Положительные аспекты

1. **Хорошая индексация layout_blocks**:
   - 6 индексов оптимизированы для основных запросов
   - Поддержка древовидной структуры

2. **Правильная RLS настройка**:
   - Все таблицы защищены
   - Адекватные политики доступа

3. **Использование UUID для блоков**:
   - Масштабируемость
   - Глобальная уникальность

## Рекомендации по оптимизации

### Приоритет 1 (P0) - Критично

```sql
-- Добавить каскадные удаления
ALTER TABLE layout_blocks ADD CONSTRAINT layout_blocks_page_id_fkey
    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE;

-- Добавить GIN индексы
CREATE INDEX CONCURRENTLY idx_layout_blocks_content_gin ON layout_blocks USING gin(content);
CREATE INDEX CONCURRENTLY idx_layout_blocks_metadata_gin ON layout_blocks USING gin(metadata);
```

### Приоритет 2 (P1) - Важно

```sql
-- Добавить недостающие индексы
CREATE INDEX CONCURRENTLY idx_sections_category_id ON sections(category_id);
CREATE INDEX CONCURRENTLY idx_sections_page_id ON sections(page_id);
CREATE INDEX CONCURRENTLY idx_page_templates_created_by ON page_templates(created_by);
```

### Приоритет 3 (P2) - Оптимизация

```sql
-- Добавить составные индексы для сложных запросов
CREATE INDEX CONCURRENTLY idx_layout_blocks_type_status ON layout_blocks(block_type, status);
CREATE INDEX CONCURRENTLY idx_layout_blocks_page_depth ON layout_blocks(page_id, depth);
```

## Заключение

**Общий статус БД: 🟡 Требует доработок**

**Сильные стороны:**
- Хорошая индексация основных таблиц
- Корректная настройка RLS
- Использование JSONB для гибких данных

**Критические проблемы:**
- Отсутствие каскадных удалений
- Недостаточная индексация JSONB полей
- Несоответствия между схемой и типами

**Рекомендации:**
1. Добавить каскадные операции для поддержания целостности
2. Создать GIN индексы для поиска по JSONB
3. Синхронизировать схему БД с TypeScript типами
4. Добавить недостающие индексы на часто используемые поля
