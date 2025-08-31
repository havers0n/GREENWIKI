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

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,https://yourdomain.com
CORS_CREDENTIALS=true
CORS_MAX_AGE=86400

# Security Configuration
NODE_ENV=development

# Rate Limiting Configuration (all times in milliseconds)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

RATE_LIMIT_AUTH_WINDOW_MS=900000
RATE_LIMIT_AUTH_MAX_REQUESTS=5

RATE_LIMIT_UPLOAD_WINDOW_MS=3600000
RATE_LIMIT_UPLOAD_MAX_REQUESTS=10

RATE_LIMIT_SEARCH_WINDOW_MS=60000
RATE_LIMIT_SEARCH_MAX_REQUESTS=30

RATE_LIMIT_ADMIN_WINDOW_MS=60000
RATE_LIMIT_ADMIN_MAX_REQUESTS=60

RATE_LIMIT_CREATE_WINDOW_MS=300000
RATE_LIMIT_CREATE_MAX_REQUESTS=20

RATE_LIMIT_BLOCKS_WINDOW_MS=60000
RATE_LIMIT_BLOCKS_MAX_REQUESTS=120

RATE_LIMIT_CRITICAL_WINDOW_MS=60000
RATE_LIMIT_CRITICAL_MAX_REQUESTS=10
```

## Получение ключей Supabase

1. Перейдите в ваш проект Supabase
2. В разделе **Settings > API** найдите:
   - **Project URL** - для SUPABASE_URL
   - **anon public** - для SUPABASE_ANON_KEY
   - **service_role** - для SUPABASE_SERVICE_ROLE_KEY
