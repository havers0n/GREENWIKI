-- Создание примеров переиспользуемых блоков из базовых атомарных блоков
-- Этот скрипт демонстрирует, как наша новая атомарная система работает

-- Сначала создадим переиспользуемый блок "Стандартная шапка"
-- Он будет состоять из: Section + Container + Heading + Button

-- 1. Создаем корневой блок (Section)
INSERT INTO layout_blocks (page_identifier, block_type, content, metadata, position, status, created_at)
VALUES (
  'reusable-header',
  'section',
  '{"backgroundColor": "#ffffff", "padding": "medium", "maxWidth": "1200px"}'::jsonb,
  '{"reusable": true}'::jsonb,
  1,
  'published',
  NOW()
) RETURNING id;

-- 2. Создаем контейнер внутри секции
INSERT INTO layout_blocks (page_identifier, block_type, content, metadata, parent_block_id, slot, position, status, created_at)
VALUES (
  'reusable-header',
  'container',
  '{"layout": "horizontal", "gap": "large", "padding": "none", "backgroundColor": ""}'::jsonb,
  '{}'::jsonb,
  (SELECT id FROM layout_blocks WHERE block_type = 'section' AND metadata->>'reusable' = 'true' ORDER BY created_at DESC LIMIT 1),
  'content',
  1,
  'published',
  NOW()
);

-- 3. Создаем заголовок внутри контейнера
INSERT INTO layout_blocks (page_identifier, block_type, content, metadata, parent_block_id, slot, position, status, created_at)
VALUES (
  'reusable-header',
  'heading',
  '{"text": "Мой Форум", "level": 1, "align": "left"}'::jsonb,
  '{}'::jsonb,
  (SELECT id FROM layout_blocks WHERE block_type = 'container' AND page_identifier = 'reusable-header' ORDER BY created_at DESC LIMIT 1),
  'content',
  1,
  'published',
  NOW()
);

-- 4. Создаем кнопку внутри контейнера
INSERT INTO layout_blocks (page_identifier, block_type, content, metadata, parent_block_id, slot, position, status, created_at)
VALUES (
  'reusable-header',
  'button',
  '{"text": "Войти", "link": "/login", "variant": "primary", "size": "medium"}'::jsonb,
  '{}'::jsonb,
  (SELECT id FROM layout_blocks WHERE block_type = 'container' AND page_identifier = 'reusable-header' ORDER BY created_at DESC LIMIT 1),
  'content',
  2,
  'published',
  NOW()
);

-- 5. Создаем переиспользуемый блок из этих блоков
INSERT INTO reusable_blocks (name, description, category, tags, created_at)
VALUES (
  'Стандартная шапка',
  'Простая шапка сайта с логотипом и кнопкой входа, созданная из атомарных блоков',
  'Навигация',
  ARRAY['header', 'navigation', 'branding'],
  NOW()
);

-- Теперь создадим переиспользуемый блок "Hero-секция"
-- Он будет состоять из: Section + Heading + Text + Button

-- 1. Создаем корневой блок (Section)
INSERT INTO blocks (block_type, content, metadata, created_by)
VALUES (
  'section',
  '{"backgroundColor": "#f8f9fa", "padding": "large", "maxWidth": "800px"}'::jsonb,
  '{"reusable": true}'::jsonb,
  'system'
) RETURNING id;

-- 2. Создаем заголовок внутри секции
INSERT INTO blocks (block_type, content, metadata, parent_block_id, slot, position, created_by)
VALUES (
  'heading',
  '{"text": "Добро пожаловать на форум", "level": 1, "align": "center"}'::jsonb,
  '{}'::jsonb,
  (SELECT id FROM blocks WHERE block_type = 'section' AND metadata->>'reusable' = 'true' ORDER BY created_at DESC LIMIT 1),
  'content',
  1,
  'system'
);

-- 3. Создаем текст внутри секции
INSERT INTO blocks (block_type, content, metadata, parent_block_id, slot, position, created_by)
VALUES (
  'text',
  '{"text": "Общайтесь, делитесь знаниями и находите единомышленников в нашем сообществе."}'::jsonb,
  '{}'::jsonb,
  (SELECT id FROM blocks WHERE block_type = 'section' AND metadata->>'reusable' = 'true' ORDER BY created_at DESC LIMIT 1),
  'content',
  2,
  'system'
);

-- 4. Создаем кнопку внутри секции
INSERT INTO blocks (block_type, content, metadata, parent_block_id, slot, position, created_by)
VALUES (
  'button',
  '{"text": "Присоединиться", "link": "/register", "variant": "primary", "size": "large"}'::jsonb,
  '{}'::jsonb,
  (SELECT id FROM blocks WHERE block_type = 'section' AND metadata->>'reusable' = 'true' ORDER BY created_at DESC LIMIT 1),
  'content',
  3,
  'system'
);

-- 5. Создаем переиспользуемый блок из этих блоков
INSERT INTO reusable_blocks (name, description, category, tags, root_block_id, created_by)
VALUES (
  'Hero с кнопкой',
  'Hero-секция с заголовком, описанием и кнопкой призыва к действию',
  'Баннеры',
  ARRAY['hero', 'banner', 'cta', 'welcome'],
  (SELECT id FROM blocks WHERE block_type = 'section' AND metadata->>'reusable' = 'true' ORDER BY created_at DESC LIMIT 1),
  'system'
);

-- Создадим еще один пример: Карточка с изображением
-- Он будет состоять из: Card + Image + Heading + Text + Button

-- 1. Создаем корневой блок (Card)
INSERT INTO blocks (block_type, content, metadata, created_by)
VALUES (
  'card',
  '{"title": "", "description": "", "variant": "default", "size": "medium", "showHeader": true, "showFooter": false}'::jsonb,
  '{"reusable": true}'::jsonb,
  'system'
);

-- 2. Создаем изображение внутри карточки
INSERT INTO blocks (block_type, content, metadata, parent_block_id, slot, position, created_by)
VALUES (
  'image',
  '{"imageUrl": "https://via.placeholder.com/400x200?text=Изображение", "altText": "Пример изображения"}'::jsonb,
  '{}'::jsonb,
  (SELECT id FROM blocks WHERE block_type = 'card' AND metadata->>'reusable' = 'true' ORDER BY created_at DESC LIMIT 1),
  'content',
  1,
  'system'
);

-- 3. Создаем заголовок внутри карточки
INSERT INTO blocks (block_type, content, metadata, parent_block_id, slot, position, created_by)
VALUES (
  'heading',
  '{"text": "Заголовок карточки", "level": 3, "align": "left"}'::jsonb,
  '{}'::jsonb,
  (SELECT id FROM blocks WHERE block_type = 'card' AND metadata->>'reusable' = 'true' ORDER BY created_at DESC LIMIT 1),
  'content',
  2,
  'system'
);

-- 4. Создаем текст внутри карточки
INSERT INTO blocks (block_type, content, metadata, parent_block_id, slot, position, created_by)
VALUES (
  'text',
  '{"text": "Описание карточки с дополнительной информацией."}'::jsonb,
  '{}'::jsonb,
  (SELECT id FROM blocks WHERE block_type = 'card' AND metadata->>'reusable' = 'true' ORDER BY created_at DESC LIMIT 1),
  'content',
  3,
  'system'
);

-- 5. Создаем кнопку внутри карточки
INSERT INTO blocks (block_type, content, metadata, parent_block_id, slot, position, created_by)
VALUES (
  'button',
  '{"text": "Подробнее", "link": "#", "variant": "secondary", "size": "medium"}'::jsonb,
  '{}'::jsonb,
  (SELECT id FROM blocks WHERE block_type = 'card' AND metadata->>'reusable' = 'true' ORDER BY created_at DESC LIMIT 1),
  'footer',
  1,
  'system'
);

-- 6. Создаем переиспользуемый блок из этих блоков
INSERT INTO reusable_blocks (name, description, category, tags, root_block_id, created_by)
VALUES (
  'Карточка с изображением',
  'Карточка с изображением, заголовком, описанием и кнопкой',
  'Контент',
  ARRAY['card', 'image', 'content', 'cta'],
  (SELECT id FROM blocks WHERE block_type = 'card' AND metadata->>'reusable' = 'true' ORDER BY created_at DESC LIMIT 1),
  'system'
);
