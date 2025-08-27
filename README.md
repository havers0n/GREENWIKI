# My Forum

Форум-приложение с использованием монорепозитория на базе pnpm workspace.

## Структура проекта

```
my-forum/
├── backend/                 # Backend API
│   ├── src/
│   │   └── supabase.js     # Пример использования типов
│   └── package.json
├── frontend/               # Frontend приложение
│   ├── src/
│   │   └── supabase.ts     # Пример использования типов
│   └── package.json
├── packages/
│   └── db-types/          # Общие типы базы данных
│       ├── src/
│       │   └── index.ts   # Сюда генерируются типы из Supabase
│       └── package.json
├── supabase/              # Конфигурация Supabase
├── package.json           # Главный package.json
├── pnpm-workspace.yaml    # Конфигурация pnpm workspace
├── README.md
└── SUPABASE_SETUP.md      # Инструкции по настройке Supabase
```

## Установка и запуск

### Предварительные требования

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Supabase CLI

### Установка зависимостей

```bash
# Установка всех зависимостей для всех пакетов
pnpm install
```

### Настройка Supabase

**⚠️ Важно:** Перед генерацией типов нужно связать проект с Supabase.

1. Найдите project reference в вашем .env файле
2. Свяжите проект: `supabase link --project-ref YOUR_PROJECT_REF`
3. Подробные инструкции в файле `SUPABASE_SETUP.md`

### Генерация типов из Supabase

```bash
# Генерация типов из связанного проекта Supabase
pnpm gen:types

# Или напрямую
supabase gen types typescript --linked > packages/db-types/src/index.ts
```

### Разработка

```bash
# Запуск всех сервисов в режиме разработки
pnpm dev

# Запуск только backend
pnpm --filter @my-forum/backend dev

# Запуск только frontend
pnpm --filter @my-forum/frontend dev
```

## Пакеты

### @my-forum/backend
Backend API приложения. Содержит логику сервера и API endpoints.

**Использование типов:**
```javascript
/** @typedef { import('@my-forum/db-types').Database } Database */
const { createClient } = require('@supabase/supabase-js')

/** @type {import('@supabase/supabase-js').SupabaseClient<Database>} */
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
```

### @my-forum/frontend
Frontend приложение. Пользовательский интерфейс форума.

**Использование типов:**
```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from '@my-forum/db-types'

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### @my-forum/db-types
Общие TypeScript типы для базы данных. Этот пакет содержит типы, сгенерированные из схемы Supabase, и используется как в backend, так и в frontend для обеспечения типобезопасности.

**Текущее состояние:** Содержит базовые типы для тестирования. После связывания с Supabase будет содержать актуальные типы из вашей схемы.

## Supabase

Проект использует Supabase в качестве backend-as-a-service. Конфигурация находится в папке `supabase/`.

### Связывание проекта

```bash
# Свяжите локальный проект с Supabase
supabase link --project-ref YOUR_PROJECT_ID
```

### Генерация типов

После изменения схемы базы данных в Supabase, обновите типы:

```bash
# Генерация типов из связанного проекта
pnpm gen:types
```

## Разработка

### Добавление новых пакетов

1. Создайте новую папку в `packages/`
2. Добавьте `package.json` с именем `@my-forum/package-name`
3. Обновите `pnpm-workspace.yaml` если необходимо

### Работа с зависимостями

```bash
# Добавить зависимость в конкретный пакет
pnpm --filter @my-forum/backend add express

# Добавить dev зависимость
pnpm --filter @my-forum/frontend add -D typescript

# Добавить зависимость между пакетами
pnpm --filter @my-forum/backend add @my-forum/db-types
```

## Преимущества этой архитектуры

1. **Типобезопасность**: Общие типы между frontend и backend
2. **Автоматическая синхронизация**: Типы обновляются автоматически при изменении схемы
3. **Монорепозиторий**: Управление всеми пакетами из одного места
4. **Workspace зависимости**: Простой импорт между пакетами
5. **Чистые импорты**: `import { Database } from '@my-forum/db-types'`

## Следующие шаги

1. **Настройте Supabase**: Следуйте инструкциям в `SUPABASE_SETUP.md`
2. **Свяжите проект**: `supabase link --project-ref YOUR_PROJECT_REF`
3. **Сгенерируйте типы**: `pnpm gen:types`
4. **Начните разработку**: `pnpm dev`
