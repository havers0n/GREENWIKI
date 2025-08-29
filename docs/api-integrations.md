# 🔗 API Интеграции CMS

## Обзор

Комплексная система API для интеграции CMS с внешними сервисами, headless использования и автоматизации.

## 🏗️ Архитектура API

### API Gateway

```typescript
interface APIGateway {
  // Маршрутизация запросов
  router: RequestRouter;

  // Аутентификация и авторизация
  auth: AuthenticationMiddleware;

  // Ограничение запросов
  rateLimit: RateLimitMiddleware;

  // Кеширование ответов
  cache: CacheMiddleware;

  // Логирование
  logger: LoggingMiddleware;

  // Мониторинг
  monitoring: MonitoringMiddleware;
}
```

### REST API Структура

```typescript
interface APIEndpoints {
  // Content Management
  content: ContentAPI;

  // Media Management
  media: MediaAPI;

  // User Management
  users: UserAPI;

  // Template System
  templates: TemplateAPI;

  // Plugin System
  plugins: PluginAPI;

  // Analytics
  analytics: AnalyticsAPI;

  // Webhooks
  webhooks: WebhookAPI;
}
```

## 📋 Content Management API

### CRUD операции

```typescript
class ContentAPI {
  // Получение контента
  @GET('/api/content/:type')
  async getContent(type: string, query: ContentQuery): Promise<ContentList>

  // Создание контента
  @POST('/api/content/:type')
  async createContent(type: string, data: CreateContentRequest): Promise<Content>

  // Обновление контента
  @PUT('/api/content/:type/:id')
  async updateContent(type: string, id: string, data: UpdateContentRequest): Promise<Content>

  // Удаление контента
  @DELETE('/api/content/:type/:id')
  async deleteContent(type: string, id: string): Promise<void>

  // Публикация контента
  @POST('/api/content/:type/:id/publish')
  async publishContent(type: string, id: string): Promise<Content>
}
```

### Продвинутые запросы

```typescript
interface ContentQuery {
  // Фильтрация
  filter?: ContentFilter;

  // Сортировка
  sort?: SortOptions;

  // Пагинация
  pagination?: PaginationOptions;

  // Поиск
  search?: SearchOptions;

  // Поля для выборки
  fields?: string[];

  // Связи
  include?: string[];
}

interface ContentFilter {
  status?: 'draft' | 'published' | 'archived';
  author?: string;
  category?: string;
  tags?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  customFields?: Record<string, any>;
}
```

## 🎨 Template API

### Управление шаблонами

```typescript
class TemplateAPI {
  // Получение шаблона
  @GET('/api/templates/:id')
  async getTemplate(id: string): Promise<Template>

  // Рендеринг шаблона
  @POST('/api/templates/:id/render')
  async renderTemplate(id: string, context: RenderContext): Promise<string>

  // Создание шаблона
  @POST('/api/templates')
  async createTemplate(data: CreateTemplateRequest): Promise<Template>

  // Обновление шаблона
  @PUT('/api/templates/:id')
  async updateTemplate(id: string, data: UpdateTemplateRequest): Promise<Template>
}
```

### Template Variables API

```typescript
interface RenderContext {
  site: SiteContext;
  page: PageContext;
  user?: UserContext;
  content: ContentContext;
  custom: Record<string, any>;
}

interface SiteContext {
  name: string;
  url: string;
  language: string;
  theme: string;
  settings: Record<string, any>;
}
```

## 👥 User Management API

### Аутентификация

```typescript
class AuthAPI {
  // Вход в систему
  @POST('/api/auth/login')
  async login(credentials: LoginRequest): Promise<AuthResponse>

  // Регистрация
  @POST('/api/auth/register')
  async register(userData: RegisterRequest): Promise<AuthResponse>

  // Обновление токена
  @POST('/api/auth/refresh')
  async refreshToken(refreshToken: string): Promise<AuthResponse>

  // Выход
  @POST('/api/auth/logout')
  async logout(): Promise<void>

  // Получение профиля
  @GET('/api/auth/me')
  async getProfile(): Promise<UserProfile>
}
```

### Управление пользователями

```typescript
class UserAPI {
  // Получение списка пользователей
  @GET('/api/users')
  async getUsers(query: UserQuery): Promise<UserList>

  // Создание пользователя
  @POST('/api/users')
  async createUser(userData: CreateUserRequest): Promise<User>

  // Обновление пользователя
  @PUT('/api/users/:id')
  async updateUser(id: string, userData: UpdateUserRequest): Promise<User>

  // Управление ролями
  @POST('/api/users/:id/roles')
  async assignRole(userId: string, roleId: string): Promise<void>

  // Управление правами
  @POST('/api/users/:id/permissions')
  async grantPermission(userId: string, permission: PermissionRequest): Promise<void>
}
```

## 📸 Media API

### Загрузка и управление файлами

```typescript
class MediaAPI {
  // Загрузка файла
  @POST('/api/media/upload')
  async uploadFile(file: FormData, metadata?: MediaMetadata): Promise<MediaFile>

  // Получение файла
  @GET('/api/media/:id')
  async getMediaFile(id: string, options?: MediaOptions): Promise<Blob>

  // Обновление метаданных
  @PUT('/api/media/:id/metadata')
  async updateMetadata(id: string, metadata: MediaMetadata): Promise<MediaFile>

  // Удаление файла
  @DELETE('/api/media/:id')
  async deleteMediaFile(id: string): Promise<void>
}
```

### Обработка изображений

```typescript
interface MediaOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  crop?: CropOptions;
  filters?: string[];
}
```

## 📊 Analytics API

### Сбор статистики

```typescript
class AnalyticsAPI {
  // Отслеживание событий
  @POST('/api/analytics/events')
  async trackEvent(event: AnalyticsEvent): Promise<void>

  // Получение статистики
  @GET('/api/analytics/stats')
  async getStats(query: AnalyticsQuery): Promise<AnalyticsData>

  // Экспорт данных
  @GET('/api/analytics/export')
  async exportData(query: ExportQuery): Promise<Blob>
}
```

### Типы событий

```typescript
interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  context: {
    page: string;
    referrer?: string;
    userAgent: string;
  };
}
```

## 🔗 Webhook система

### Управление webhook'ами

```typescript
class WebhookAPI {
  // Создание webhook
  @POST('/api/webhooks')
  async createWebhook(config: WebhookConfig): Promise<Webhook>

  // Получение списка webhook'ов
  @GET('/api/webhooks')
  async getWebhooks(): Promise<Webhook[]>

  // Тестирование webhook
  @POST('/api/webhooks/:id/test')
  async testWebhook(id: string, payload: any): Promise<TestResult>

  // Удаление webhook
  @DELETE('/api/webhooks/:id')
  async deleteWebhook(id: string): Promise<void>
}
```

### Webhook конфигурация

```typescript
interface WebhookConfig {
  url: string;
  events: WebhookEvent[];
  secret: string;
  headers?: Record<string, string>;
  retryPolicy?: RetryPolicy;
  filters?: WebhookFilter[];
}

enum WebhookEvent {
  CONTENT_CREATED = 'content.created',
  CONTENT_UPDATED = 'content.updated',
  CONTENT_DELETED = 'content.deleted',
  CONTENT_PUBLISHED = 'content.published',
  USER_REGISTERED = 'user.registered',
  USER_UPDATED = 'user.updated',
  MEDIA_UPLOADED = 'media.uploaded'
}
```

## 🔌 Plugin API

### Управление плагинами

```typescript
class PluginAPI {
  // Установка плагина
  @POST('/api/plugins/install')
  async installPlugin(pluginData: InstallPluginRequest): Promise<Plugin>

  // Активация плагина
  @POST('/api/plugins/:id/activate')
  async activatePlugin(id: string): Promise<void>

  // Деактивация плагина
  @POST('/api/plugins/:id/deactivate')
  async deactivatePlugin(id: string): Promise<void>

  // Обновление плагина
  @POST('/api/plugins/:id/update')
  async updatePlugin(id: string, updateData: UpdatePluginRequest): Promise<Plugin>

  // Удаление плагина
  @DELETE('/api/plugins/:id')
  async uninstallPlugin(id: string): Promise<void>
}
```

## 🔐 Аутентификация API

### JWT Tokens

```typescript
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  scope?: string[];
}

class TokenManager {
  // Генерация токенов
  generateTokens(user: User, scopes?: string[]): AuthTokens

  // Валидация токена
  validateToken(token: string): TokenPayload

  // Обновление токена
  refreshToken(refreshToken: string): AuthTokens

  // Отзыв токена
  revokeToken(token: string): void
}
```

### OAuth 2.0

```typescript
class OAuthProvider {
  // Авторизация
  @GET('/oauth/authorize')
  authorize(clientId: string, redirectUri: string, scope: string[]): string

  // Получение токена
  @POST('/oauth/token')
  async getToken(code: string, clientId: string, clientSecret: string): Promise<OAuthToken>

  // Валидация токена
  @POST('/oauth/introspect')
  async introspectToken(token: string): Promise<TokenInfo>
}
```

## 📡 GraphQL API

### Schema Definition

```graphql
type Query {
  # Content queries
  content(type: String, filter: ContentFilter): [Content]
  contentById(id: ID!): Content

  # User queries
  users(filter: UserFilter): [User]
  currentUser: User

  # Media queries
  mediaFiles(filter: MediaFilter): [MediaFile]

  # Template queries
  templates: [Template]
}

type Mutation {
  # Content mutations
  createContent(input: CreateContentInput!): Content
  updateContent(id: ID!, input: UpdateContentInput!): Content
  deleteContent(id: ID!): Boolean

  # User mutations
  createUser(input: CreateUserInput!): User
  updateUser(id: ID!, input: UpdateUserInput!): User

  # Media mutations
  uploadMediaFile(file: Upload!, metadata: MediaMetadataInput): MediaFile
}

type Subscription {
  # Real-time updates
  contentUpdated(type: String): ContentUpdate
  userActivity: UserActivity
}
```

## 🔄 WebSocket API

### Real-time коммуникация

```typescript
interface WebSocketAPI {
  // Подключение к каналу
  subscribe(channel: string, handler: MessageHandler): void

  // Отписка от канала
  unsubscribe(channel: string): void

  // Отправка сообщения
  send(channel: string, message: any): void

  // Пинг-понг для поддержания соединения
  ping(): void
}
```

### Типы сообщений

```typescript
enum MessageType {
  CONTENT_UPDATE = 'content_update',
  USER_ACTIVITY = 'user_activity',
  NOTIFICATION = 'notification',
  COLLABORATION = 'collaboration'
}

interface WebSocketMessage {
  type: MessageType;
  payload: any;
  timestamp: Date;
  userId?: string;
}
```

## 🛡️ Безопасность API

### Rate Limiting

```typescript
interface RateLimitConfig {
  windowMs: number;      // Временное окно
  maxRequests: number;   // Максимум запросов
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

class RateLimiter {
  // Проверка лимита
  checkLimit(identifier: string): RateLimitResult

  // Сброс счетчика
  reset(identifier: string): void

  // Получение статистики
  getStats(identifier: string): RateLimitStats
}
```

### API Keys

```typescript
interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  expiresAt?: Date;
  lastUsed?: Date;
  createdBy: string;
}

class APIKeyManager {
  // Генерация нового ключа
  generateKey(name: string, permissions: string[], expiresIn?: number): APIKey

  // Валидация ключа
  validateKey(key: string): APIKeyValidation

  // Отзыв ключа
  revokeKey(keyId: string): void

  // Ротация ключа
  rotateKey(keyId: string): APIKey
}
```

## 📊 Мониторинг и логирование

### API Metrics

```typescript
interface APIMetrics {
  requests: {
    total: number;
    successful: number;
    failed: number;
    byEndpoint: Record<string, number>;
    byMethod: Record<string, number>;
  };
  performance: {
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
  errors: {
    byType: Record<string, number>;
    byEndpoint: Record<string, number>;
  };
}
```

### Логирование запросов

```typescript
interface APIRequestLog {
  id: string;
  timestamp: Date;
  method: string;
  url: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  requestHeaders: Record<string, string>;
  requestBody?: any;
  responseStatus: number;
  responseTime: number;
  error?: string;
}
```

## 🚀 Оптимизация производительности

### Кеширование

```typescript
interface CacheConfig {
  strategy: 'memory' | 'redis' | 'filesystem';
  ttl: number;
  keyGenerator?: (request: Request) => string;
  invalidationRules?: CacheInvalidationRule[];
}

class APICache {
  // Получение из кеша
  get(key: string): Promise<any>

  // Сохранение в кеш
  set(key: string, value: any, ttl?: number): Promise<void>

  // Инвалидация кеша
  invalidate(pattern: string): Promise<void>

  // Очистка кеша
  clear(): Promise<void>
}
```

### Пагинация

```typescript
interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
  cursor?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
}
```

## 📚 Документация API

### OpenAPI/Swagger

```yaml
openapi: 3.0.0
info:
  title: CMS API
  version: 1.0.0
  description: REST API для управления контентом CMS

servers:
  - url: https://api.cms.example.com/v1
    description: Production server

paths:
  /content:
    get:
      summary: Получить список контента
      parameters:
        - name: type
          in: query
          schema:
            type: string
        - name: page
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: Список контента
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ContentList'
```

### SDK генерация

```typescript
// Генерация TypeScript клиента
class SDKGenerator {
  // Генерация типов
  generateTypes(): string

  // Генерация клиентской библиотеки
  generateClient(language: 'typescript' | 'javascript' | 'python' | 'php'): string

  // Генерация документации
  generateDocs(): string
}
```

---

Этот API предоставляет полный набор инструментов для интеграции CMS с внешними системами, headless использования и автоматизации бизнес-процессов.
