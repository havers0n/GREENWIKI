-- Скрипт для создания пользователя с ролью admin
-- Используйте это только для тестирования в development среде

-- Вставка или обновление профиля пользователя (замените user-id на реальный)
INSERT INTO public.profiles (id, role, username)
VALUES ('user-id-here', 'admin', 'admin-user')
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    username = 'admin-user';
