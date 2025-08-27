# Настройка Supabase для my-forum

## Шаг 1: Найдите Project Reference

Вам нужно найти project reference в вашем .env файле. Обычно он выглядит так:
```
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
```

Или в переменных окружения:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
```

## Шаг 2: Свяжите проект

Используйте найденный project reference для связывания:

```bash
# Замените YOUR_PROJECT_REF на ваш реальный project reference
supabase link --project-ref YOUR_PROJECT_REF
```

## Шаг 3: Генерируйте типы

После связывания вы сможете генерировать типы:

```bash
pnpm gen:types
```

## Альтернативный способ (если у вас есть project ID)

Если у вас есть project ID, вы можете использовать его напрямую:

```bash
# Генерация типов по project ID
supabase gen types typescript --project-id YOUR_PROJECT_ID > packages/db-types/src/index.ts
```

## Проверка связывания

Чтобы проверить, что проект связан:

```bash
supabase status
```

## Доступные проекты

Из вашего аккаунта доступны следующие проекты:
- mendelflow (xzzhjkhoepwikhdyauzy)
- danypetrov2002@gmail.com (uxcsziylmyogvcqyyuiw)  
- horizon (axgtvvcimqoyxbfvdrok)

Выберите нужный проект и используйте его reference ID для связывания.
