# Настройка переменных окружения для Supabase

## Проблема
Страница `/login` показывает белый экран из-за отсутствия переменных окружения для Supabase.

## Решение

### Шаг 1: Создайте файл `.env` в папке `frontend/`

```bash
# В папке frontend создайте файл .env
touch frontend/.env
```

### Шаг 2: Добавьте переменные окружения

Откройте файл `frontend/.env` и добавьте следующие строки:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

### Шаг 3: Получите значения из Supabase

1. Зайдите в [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **Settings** > **API**
4. Скопируйте:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public** key → `VITE_SUPABASE_ANON_KEY`

### Шаг 4: Перезапустите приложение

```bash
cd frontend
npm run dev
```

## Пример заполненного .env файла:

```env
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDU4MzM5ODEsImV4cCI6MTk2MTQwOTk4MX0.example
```
