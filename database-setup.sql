-- SQL скрипт для создания таблиц CMS системы управления контентом
-- Выполните этот скрипт в вашей базе данных Supabase

-- Таблица страниц
CREATE TABLE IF NOT EXISTS public.pages (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    author_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Таблица категорий для блоков
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon_svg TEXT,
    position INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Таблица секций
CREATE TABLE IF NOT EXISTS public.sections (
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

-- Таблица блоков макета с поддержкой вложенности
CREATE TABLE IF NOT EXISTS public.layout_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_identifier TEXT NOT NULL,
    block_type TEXT NOT NULL,
    content JSONB,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    position INTEGER,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    parent_block_id UUID REFERENCES public.layout_blocks(id),
    slot TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Таблица ревизий макета
CREATE TABLE IF NOT EXISTS public.layout_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_identifier TEXT NOT NULL,
    snapshot JSONB NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Таблица шаблонов страниц
CREATE TABLE IF NOT EXISTS public.page_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    preview_url TEXT,
    blocks JSONB NOT NULL,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_layout_blocks_page_identifier ON public.layout_blocks(page_identifier);
CREATE INDEX IF NOT EXISTS idx_layout_blocks_position ON public.layout_blocks(page_identifier, position);
CREATE INDEX IF NOT EXISTS idx_layout_blocks_parent ON public.layout_blocks(parent_block_id, position);
CREATE INDEX IF NOT EXISTS idx_layout_revisions_page ON public.layout_revisions(page_identifier, created_at DESC);

-- Дополнительные индексы для таблиц reusable_blocks
CREATE INDEX IF NOT EXISTS idx_reusable_blocks_category ON public.reusable_blocks(category);
CREATE INDEX IF NOT EXISTS idx_reusable_blocks_created_by ON public.reusable_blocks(created_by);
CREATE INDEX IF NOT EXISTS idx_reusable_blocks_created_at ON public.reusable_blocks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reusable_blocks_search ON public.reusable_blocks USING gin(to_tsvector('russian', name || ' ' || COALESCE(description, '')));

-- Индексы для таблиц block_instances
CREATE INDEX IF NOT EXISTS idx_block_instances_reusable_block_id ON public.block_instances(reusable_block_id);
CREATE INDEX IF NOT EXISTS idx_block_instances_page_id ON public.block_instances(page_id);

-- Индексы для таблиц reusable_block_content
CREATE INDEX IF NOT EXISTS idx_reusable_block_content_reusable_block_id ON public.reusable_block_content(reusable_block_id);
CREATE INDEX IF NOT EXISTS idx_reusable_block_content_version ON public.reusable_block_content(reusable_block_id, version DESC);

-- Составные индексы для сложных запросов
CREATE INDEX IF NOT EXISTS idx_layout_blocks_page_parent_position ON public.layout_blocks(page_identifier, parent_block_id, position);
CREATE INDEX IF NOT EXISTS idx_layout_blocks_status_page ON public.layout_blocks(status, page_identifier);

-- RLS политики для безопасности
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.layout_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.layout_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_templates ENABLE ROW LEVEL SECURITY;

-- Политика для публичного чтения опубликованного контента
CREATE POLICY "Public can read published pages" ON public.pages FOR SELECT USING (status = 'published');
CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public can read sections" ON public.sections FOR SELECT USING (true);
CREATE POLICY "Public can read published blocks" ON public.layout_blocks FOR SELECT USING (status = 'published');

-- Политики для администраторов (полный доступ)
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
  -- Разрешаем для пользователей с ролью admin
  EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  )
  -- ИЛИ разрешаем для service role (обход RLS для админских операций)
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

-- Вставка тестовых данных
INSERT INTO public.categories (name, slug, icon_svg, position) VALUES
('Общие', 'general', '<svg>...</svg>', 1),
('Форум', 'forum', '<svg>...</svg>', 2),
('Новости', 'news', '<svg>...</svg>', 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.pages (slug, title, content, status) VALUES
('home', 'Главная страница', 'Добро пожаловать!', 'published'),
('about', 'О нас', 'Информация о нас', 'draft')
ON CONFLICT (slug) DO NOTHING;

-- Комментарии для пояснения
COMMENT ON TABLE public.layout_blocks IS 'Блоки макета страниц с поддержкой вложенности';
COMMENT ON TABLE public.layout_revisions IS 'Ревизии макета для отката изменений';
COMMENT ON TABLE public.page_templates IS 'Шаблоны страниц для быстрого создания';

COMMENT ON COLUMN public.layout_blocks.parent_block_id IS 'ID родительского блока для вложенности';
COMMENT ON COLUMN public.layout_blocks.slot IS 'Именованный слот внутри родительского блока';
COMMENT ON COLUMN public.layout_revisions.snapshot IS 'Снимок состояния блоков страницы в JSON формате';
