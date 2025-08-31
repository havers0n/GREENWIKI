-- Скрипт для проверки роли пользователя в базе данных
-- Замените 'user-id-here' на реальный ID пользователя из логов

-- Проверить профиль пользователя
SELECT id, role, username FROM public.profiles WHERE id = 'user-id-here';

-- Проверить все профили с ролью admin
SELECT id, role, username FROM public.profiles WHERE role = 'admin';

-- Проверить все профили
SELECT id, role, username FROM public.profiles;
