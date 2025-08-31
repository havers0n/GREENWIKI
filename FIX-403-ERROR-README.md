# Исправление ошибки 403 при создании блоков

## Проблема
При попытке создать блоки в редакторе возникала ошибка 403 (Forbidden), несмотря на то, что пользователь был аутентифицирован.

## Причина
1. **Отсутствие authMiddleware**: В POST `/api/layout` роуте отсутствовал `authMiddleware`, что приводило к тому, что `req.user` и `req.isAdmin` не устанавливались.
2. **RLS политика**: Row Level Security политика проверяла `auth.uid()`, но в контексте service role этот uid мог быть не определен.

## Исправления

### 1. Backend исправления
✅ Добавлен `authMiddleware` в POST `/api/layout` роут
✅ Обновлены RLS политики для поддержки service role

### 2. Применение исправлений к базе данных

**Шаг 1**: Выполните скрипт обновления RLS политик в SQL редакторе Supabase:

```sql
-- Выполните содержимое файла update-rls-policies.sql
```

Или скопируйте и выполните этот код:

```sql
-- Удаляем старые политики
DROP POLICY IF EXISTS "Admins can manage pages" ON public.pages;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage sections" ON public.sections;
DROP POLICY IF EXISTS "Admins can manage layout blocks" ON public.layout_blocks;
DROP POLICY IF EXISTS "Admins can manage revisions" ON public.layout_revisions;
DROP POLICY IF EXISTS "Admins can manage templates" ON public.page_templates;

-- Создаем обновленные политики с поддержкой service_role
CREATE POLICY "Admins can manage pages" ON public.pages FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
    OR auth.role() = 'service_role'
);

CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
    OR auth.role() = 'service_role'
);

CREATE POLICY "Admins can manage sections" ON public.sections FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
    OR auth.role() = 'service_role'
);

CREATE POLICY "Admins can manage layout blocks" ON public.layout_blocks FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
    OR auth.role() = 'service_role'
);

CREATE POLICY "Admins can manage revisions" ON public.layout_revisions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
    OR auth.role() = 'service_role'
);

CREATE POLICY "Admins can manage templates" ON public.page_templates FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
    OR auth.role() = 'service_role'
);
```

**Шаг 2**: Проверьте, что у пользователя есть роль 'admin':

```sql
-- Проверьте профиль пользователя (замените user-id на реальный ID)
SELECT id, role, username FROM public.profiles WHERE id = 'user-id-here';

-- Если пользователя нет или у него нет роли admin, создайте/обновите:
INSERT INTO public.profiles (id, role, username)
VALUES ('user-id-here', 'admin', 'admin-user')
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    username = 'admin-user';
```

### 3. Перезапуск серверов
После применения изменений к базе данных:

1. Перезапустите backend сервер:
```bash
cd backend
npm run build
npm run dev
```

2. Перезапустите frontend сервер:
```bash
cd frontend
npm run dev
```

## Тестирование
1. Откройте приложение в браузере
2. Попробуйте добавить блок (например, "Отступ" или "Секция")
3. Ошибка 403 больше не должна появляться

## Файлы, измененные в исправлении
- `backend/src/routes/layoutRoutes.ts` - добавлен authMiddleware
- `database-setup.sql` - обновлены RLS политики
- `update-rls-policies.sql` - скрипт для применения исправлений
- `check-user-role.sql` - скрипт для проверки роли пользователя
- `create-admin-user.sql` - скрипт для создания admin пользователя

## Дополнительная информация
Если проблема сохраняется после применения исправлений, проверьте:
1. Правильно ли настроены переменные окружения SUPABASE_SERVICE_ROLE_KEY
2. Есть ли пользователь в таблице profiles с правильной ролью
3. Логи сервера на наличие других ошибок
