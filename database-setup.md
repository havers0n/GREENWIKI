# Настройка базы данных Supabase

## Автоматическое создание таблицы profiles

### Вариант 1: Через отладочную страницу
1. Перейдите на `/debug`
2. Если есть ошибка "Таблица profiles не существует"
3. Нажмите кнопку **"🔧 Создать таблицу profiles"**

### Вариант 2: Через Supabase Studio

#### Шаг 1: Создание таблицы
1. Откройте [Supabase Studio](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **SQL Editor**
4. Выполните этот SQL:

```sql
-- Создание таблицы profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'user',
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индекса для производительности
CREATE INDEX profiles_role_idx ON profiles(role);
CREATE INDEX profiles_username_idx ON profiles(username);
```

#### Шаг 2: Настройка RLS (Row Level Security)
```sql
-- Включить RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Политика для чтения собственного профиля
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Политика для создания собственного профиля
CREATE POLICY "Users can create own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Политика для обновления собственного профиля
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Политика для администраторов (чтение всех профилей)
CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### Шаг 3: Создание функции для автоматического создания профиля
```sql
-- Функция для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, username)
  VALUES (new.id, 'user', new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоматического создания профиля
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## Проверка настройки

### Через отладочную страницу
1. Перейдите на `/debug`
2. Проверьте статус загрузки - должно быть "Загрузка завершена"
3. Проверьте раздел "Профиль" - должен показывать данные профиля
4. Ошибки должны отсутствовать

### Через консоль браузера
```javascript
// Проверить статус аутентификации
console.log(window.__AUTH_DEBUG__);

// Проверить профиль
console.log('Profile:', window.__AUTH_DEBUG__?.profile);
console.log('Error:', window.__AUTH_DEBUG__?.error);
```

## Устранение неполадок

### Ошибка "Таблица profiles не существует"
- Следуйте инструкциям выше для создания таблицы
- Или используйте кнопку на странице `/debug`

### Ошибка "Нет прав доступа"
- Проверьте RLS политики в Supabase Studio
- Убедитесь, что пользователь авторизован

### Ошибка "Ошибка подключения"
- Проверьте переменные окружения в `.env`
- Убедитесь, что Supabase проект активен
- Проверьте квоты использования

## Следующие шаги

1. **Создайте таблицу profiles** используя один из способов выше
2. **Перезагрузите страницу**
3. **Перейдите в админ-панель** и назначьте себе роль администратора
4. **Наслаждайтесь полной функциональностью!** 🎉