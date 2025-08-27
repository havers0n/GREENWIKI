# Конфигурация переменных окружения для бэкенда

Создайте файл `.env` в папке `backend/` со следующими переменными:

```bash
# Supabase Configuration
# Получите эти значения из вашего Supabase проекта в разделе Settings > API
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Server Configuration
PORT=3001
```

## Получение ключей Supabase

1. Перейдите в ваш проект Supabase
2. В разделе **Settings > API** найдите:
   - **Project URL** - для SUPABASE_URL
   - **anon public** - для SUPABASE_ANON_KEY
   - **service_role** - для SUPABASE_SERVICE_ROLE_KEY
