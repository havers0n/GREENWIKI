-- Скрипт для обновления RLS политик в базе данных Supabase
-- Выполните этот скрипт в SQL редакторе Supabase

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
