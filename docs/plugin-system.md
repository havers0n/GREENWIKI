# 🔌 Система плагинов CMS

## Обзор

Модульная система плагинов для расширения функциональности CMS без изменения ядра системы.

## 🏗️ Архитектура плагинов

### Plugin Manifest

```typescript
interface PluginManifest {
  // Метаданные
  name: string;
  version: string;
  description: string;
  author: string;
  license?: string;

  // Совместимость
  cmsVersion: string;
  minCmsVersion?: string;
  maxCmsVersion?: string;

  // Точки входа
  main: string;           // Главный файл плагина
  admin?: string;         // Админ интерфейс
  public?: string;        // Публичная часть

  // Зависимости
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;

  // Разрешения
  permissions?: PluginPermission[];

  // Хуки
  hooks?: string[];

  // Настройки
  settings?: PluginSetting[];
}
```

### Plugin Instance

```typescript
interface Plugin {
  id: string;
  manifest: PluginManifest;

  // Состояние
  status: PluginStatus;
  enabled: boolean;
  installedAt: Date;

  // Настройки
  settings: Record<string, any>;

  // Метаданные
  createdBy: string;
  updatedAt: Date;
}

enum PluginStatus {
  INSTALLED = 'installed',
  ACTIVATED = 'activated',
  DEACTIVATED = 'deactivated',
  ERROR = 'error',
  OUTDATED = 'outdated'
}
```

## 🔧 Plugin API

### Lifecycle Management

```typescript
interface PluginLifecycle {
  // Инициализация плагина
  onLoad(): Promise<void>;

  // Активация плагина
  onActivate(): Promise<void>;

  // Деактивация плагина
  onDeactivate(): Promise<void>;

  // Выгрузка плагина
  onUnload(): Promise<void>;

  // Обновление плагина
  onUpdate(fromVersion: string, toVersion: string): Promise<void>;
}
```

### Hook System

```typescript
interface PluginHooks {
  // Content hooks
  onContentCreate?: (content: Content) => Promise<Content>;
  onContentUpdate?: (content: Content, previous: Content) => Promise<Content>;
  onContentDelete?: (contentId: string) => Promise<void>;
  onContentPublish?: (content: Content) => Promise<void>;

  // Template hooks
  onTemplateRender?: (template: Template, context: RenderContext) => Promise<string>;
  onTemplateCompile?: (template: Template) => Promise<Template>;

  // User hooks
  onUserLogin?: (user: User) => Promise<void>;
  onUserRegister?: (user: User) => Promise<User>;
  onUserUpdate?: (user: User, previous: User) => Promise<User>;

  // Media hooks
  onMediaUpload?: (file: MediaFile) => Promise<MediaFile>;
  onMediaDelete?: (fileId: string) => Promise<void>;

  // API hooks
  onApiCall?: (request: APIRequest) => Promise<APIResponse>;
  onApiResponse?: (response: APIResponse) => Promise<APIResponse>;

  // Admin hooks
  onAdminPanelLoad?: (panel: AdminPanel) => Promise<void>;
  onAdminMenuLoad?: (menu: AdminMenu) => Promise<AdminMenu>;

  // Frontend hooks
  onPageRender?: (page: Page, context: RenderContext) => Promise<string>;
  onFrontendLoad?: () => Promise<void>;
}
```

## 🎯 Типы плагинов

### 1. **Content Plugins**

```typescript
class ContentPlugin implements PluginHooks {
  // Добавление новых типов контента
  registerContentTypes(): ContentType[]

  // Расширение существующих типов
  extendContentType(type: string, extensions: ContentTypeExtension): void

  // Кастомные поля
  registerCustomFields(): CustomField[]
}
```

### 2. **Template Plugins**

```typescript
class TemplatePlugin implements PluginHooks {
  // Регистрация хелперов шаблонов
  registerTemplateHelpers(): TemplateHelper[]

  // Кастомные теги шаблонов
  registerTemplateTags(): TemplateTag[]

  // Фильтры шаблонов
  registerTemplateFilters(): TemplateFilter[]
}
```

### 3. **Media Plugins**

```typescript
class MediaPlugin implements PluginHooks {
  // Новые форматы файлов
  registerMediaTypes(): MediaType[]

  // Процессоры медиа
  registerProcessors(): MediaProcessor[]

  // Интеграция с внешними сервисами
  registerStorageProviders(): StorageProvider[]
}
```

### 4. **Integration Plugins**

```typescript
class IntegrationPlugin implements PluginHooks {
  // API интеграции
  registerAPIEndpoints(): APIEndpoint[]

  // Webhook обработчики
  registerWebhooks(): WebhookHandler[]

  // OAuth провайдеры
  registerOAuthProviders(): OAuthProvider[]
}
```

### 5. **UI Plugins**

```typescript
class UIPlugin implements PluginHooks {
  // Компоненты админ панели
  registerAdminComponents(): AdminComponent[]

  // Виджеты для контента
  registerContentWidgets(): ContentWidget[]

  // Кастомные страницы
  registerPages(): PageDefinition[]
}
```

## 📦 Plugin Manager

### Управление плагинами

```typescript
class PluginManager {
  // Установка плагина
  async install(pluginData: PluginInstallData): Promise<Plugin>

  // Активация плагина
  async activate(pluginId: string): Promise<void>

  // Деактивация плагина
  async deactivate(pluginId: string): Promise<void>

  // Удаление плагина
  async uninstall(pluginId: string): Promise<void>

  // Обновление плагина
  async update(pluginId: string, newVersion: string): Promise<void>

  // Получение списка плагинов
  async getPlugins(filter?: PluginFilter): Promise<Plugin[]>

  // Выполнение хука
  async executeHook(hookName: string, ...args: any[]): Promise<any>
}
```

### Plugin Registry

```typescript
class PluginRegistry {
  // Регистрация плагина
  register(plugin: Plugin): void

  // Отмена регистрации
  unregister(pluginId: string): void

  // Поиск плагинов
  findPlugins(query: PluginQuery): Plugin[]

  // Получение плагина по ID
  getPlugin(id: string): Plugin | null

  // Получение активных плагинов
  getActivePlugins(): Plugin[]
}
```

## 🔧 Plugin Development Kit

### Plugin Structure

```
my-plugin/
├── manifest.json          # Описание плагина
├── package.json           # NPM зависимости
├── src/
│   ├── index.ts          # Главная точка входа
│   ├── admin.ts          # Админ интерфейс
│   ├── public.ts         # Публичная часть
│   └── components/       # React компоненты
├── assets/               # Статические файлы
├── templates/            # Шаблоны плагина
├── migrations/           # Базы данных миграции
└── docs/                 # Документация
```

### Plugin Bootstrap

```typescript
// my-plugin/src/index.ts
import { Plugin, PluginManifest } from '@cms/plugin-api';

const manifest: PluginManifest = {
  name: 'My Awesome Plugin',
  version: '1.0.0',
  description: 'Добавляет крутые возможности',
  author: 'Developer Name',
  cmsVersion: '>=1.0.0',
  main: 'dist/index.js',
  admin: 'dist/admin.js',
  permissions: [
    'content.create',
    'content.update'
  ],
  hooks: [
    'onContentCreate',
    'onContentUpdate'
  ]
};

class MyPlugin extends Plugin {
  async onLoad() {
    console.log('My plugin loaded!');
  }

  async onActivate() {
    console.log('My plugin activated!');
  }

  async onContentCreate(content: Content) {
    // Добавление метаданных к контенту
    return {
      ...content,
      metadata: {
        ...content.metadata,
        processedBy: 'MyPlugin'
      }
    };
  }
}

export default new MyPlugin(manifest);
```

## 🎨 UI Extensions

### Admin Panel Extensions

```typescript
interface AdminExtension {
  // Добавление пунктов меню
  menuItems: MenuItem[];

  // Добавление страниц
  pages: AdminPage[];

  // Добавление виджетов дашборда
  dashboardWidgets: DashboardWidget[];

  // Кастомные компоненты
  components: Record<string, React.ComponentType>;
}

// Регистрация расширений
plugin.registerAdminExtension({
  menuItems: [
    {
      label: 'Мой плагин',
      path: '/admin/my-plugin',
      icon: '🔌'
    }
  ],
  pages: [
    {
      path: '/admin/my-plugin',
      component: MyPluginPage
    }
  ]
});
```

### Content Editor Extensions

```typescript
interface ContentEditorExtension {
  // Кастомные поля
  fields: CustomField[];

  // Панели редактора
  panels: EditorPanel[];

  // Кнопки тулбара
  toolbarButtons: ToolbarButton[];

  // Контекстные действия
  contextActions: ContextAction[];
}
```

## 🔗 API Extensions

### Custom Endpoints

```typescript
// Регистрация API endpoints
plugin.registerAPIEndpoints([
  {
    method: 'GET',
    path: '/api/my-plugin/data',
    handler: async (req, res) => {
      const data = await getMyPluginData();
      res.json(data);
    },
    permissions: ['my-plugin.read']
  },
  {
    method: 'POST',
    path: '/api/my-plugin/action',
    handler: async (req, res) => {
      const result = await performMyPluginAction(req.body);
      res.json(result);
    },
    permissions: ['my-plugin.write']
  }
]);
```

### Webhook Handlers

```typescript
plugin.registerWebhookHandlers({
  'content.created': async (payload) => {
    await notifyExternalService(payload);
  },
  'user.registered': async (payload) => {
    await sendWelcomeEmail(payload);
  }
});
```

## 💾 Data Management

### Custom Database Tables

```typescript
// Определение схемы
const pluginSchema = {
  tables: [
    {
      name: 'plugin_data',
      columns: [
        { name: 'id', type: 'uuid', primary: true },
        { name: 'data', type: 'jsonb' },
        { name: 'created_at', type: 'timestamp' }
      ]
    }
  ]
};

// Регистрация схемы
plugin.registerDatabaseSchema(pluginSchema);
```

### Migrations

```typescript
// Миграции для обновлений
plugin.registerMigrations([
  {
    version: '1.0.1',
    up: async (db) => {
      await db.query('ALTER TABLE plugin_data ADD COLUMN updated_at TIMESTAMP');
    },
    down: async (db) => {
      await db.query('ALTER TABLE plugin_data DROP COLUMN updated_at');
    }
  }
]);
```

## 🔐 Security & Permissions

### Plugin Permissions

```typescript
interface PluginPermission {
  name: string;
  description: string;
  scope: 'global' | 'content' | 'user' | 'media';
  defaultValue: boolean;
}

// Регистрация разрешений
plugin.registerPermissions([
  {
    name: 'my-plugin.admin',
    description: 'Полный доступ к плагину',
    scope: 'global',
    defaultValue: false
  },
  {
    name: 'my-plugin.content',
    description: 'Доступ к контенту плагина',
    scope: 'content',
    defaultValue: true
  }
]);
```

### Access Control

```typescript
// Проверка разрешений в плагине
class MyPlugin extends Plugin {
  async performAdminAction() {
    if (!this.hasPermission('my-plugin.admin')) {
      throw new Error('Недостаточно прав');
    }
    // Выполнение действия...
  }
}
```

## 📦 Plugin Store

### Marketplace

```typescript
interface PluginMarketplace {
  // Поиск плагинов
  search(query: PluginSearchQuery): Promise<PluginInfo[]>

  // Получение деталей плагина
  getPluginInfo(id: string): Promise<PluginInfo>

  // Скачивание плагина
  downloadPlugin(id: string): Promise<PluginPackage>

  // Отзывы и рейтинги
  getReviews(id: string): Promise<Review[]>

  // Статистика загрузок
  getStats(id: string): Promise<PluginStats>
}
```

### Plugin Repository

```typescript
interface PluginRepository {
  // Публикация плагина
  publish(plugin: PluginPackage): Promise<PublishedPlugin>

  // Обновление версии
  updateVersion(id: string, version: PluginVersion): Promise<void>

  // Управление категориями
  getCategories(): Promise<PluginCategory[]>

  // Модерация
  approvePlugin(id: string): Promise<void>
  rejectPlugin(id: string, reason: string): Promise<void>
}
```

## 🧪 Testing & Validation

### Plugin Validator

```typescript
class PluginValidator {
  // Валидация манифеста
  validateManifest(manifest: PluginManifest): ValidationResult

  // Проверка зависимостей
  validateDependencies(manifest: PluginManifest): DependencyCheck

  // Сканирование безопасности
  securityScan(plugin: PluginPackage): SecurityReport

  // Проверка совместимости
  compatibilityCheck(manifest: PluginManifest, cmsVersion: string): CompatibilityResult
}
```

### Test Environment

```typescript
class PluginTestEnvironment {
  // Создание изолированной среды
  createSandbox(): PluginSandbox

  // Запуск плагина в песочнице
  runInSandbox(plugin: Plugin, sandbox: PluginSandbox): Promise<TestResult>

  // Мониторинг ресурсов
  monitorResources(sandbox: PluginSandbox): ResourceUsage

  // Очистка после тестов
  cleanup(sandbox: PluginSandbox): Promise<void>
}
```

## 📊 Analytics & Monitoring

### Plugin Metrics

```typescript
interface PluginMetrics {
  usage: {
    activeInstallations: number;
    dailyActiveUsers: number;
    totalActions: number;
  };
  performance: {
    averageLoadTime: number;
    memoryUsage: number;
    errorRate: number;
  };
  errors: {
    byType: Record<string, number>;
    recentErrors: PluginError[];
  };
}
```

### Monitoring

```typescript
class PluginMonitor {
  // Отслеживание использования
  trackUsage(pluginId: string, action: string, data?: any): void

  // Логирование ошибок
  logError(pluginId: string, error: Error, context?: any): void

  // Сбор метрик
  collectMetrics(pluginId: string): Promise<PluginMetrics>

  // Создание отчетов
  generateReport(pluginId: string, period: DateRange): Promise<PluginReport>
}
```

## 🚀 Deployment & Distribution

### Plugin Packaging

```typescript
class PluginPackager {
  // Создание пакета плагина
  createPackage(plugin: Plugin): Promise<PluginPackage>

  // Извлечение пакета
  extractPackage(packagePath: string): Promise<Plugin>

  // Проверка целостности
  verifyPackage(packagePath: string): Promise<VerificationResult>

  // Оптимизация размера
  optimizePackage(plugin: Plugin): Promise<Plugin>
}
```

### Distribution Channels

```typescript
interface DistributionChannel {
  name: string;
  type: 'marketplace' | 'private' | 'enterprise';
  url: string;
  apiKey?: string;
  publishPlugin(plugin: PluginPackage): Promise<string>;
  updatePlugin(id: string, update: PluginUpdate): Promise<void>;
  getStats(id: string): Promise<ChannelStats>;
}
```

## 📚 Documentation & Support

### Plugin Documentation

```typescript
interface PluginDocumentation {
  readme: string;
  apiReference: APIReference;
  examples: CodeExample[];
  tutorials: Tutorial[];
  faq: FAQ[];
  changelog: ChangelogEntry[];
}
```

### Developer Support

```typescript
interface DeveloperSupport {
  // Форумы и сообщество
  community: {
    forumUrl: string;
    discordUrl?: string;
    slackUrl?: string;
  };

  // Техническая поддержка
  support: {
    email: string;
    helpdeskUrl?: string;
    priorityLevels: SupportLevel[];
  };

  // Ресурсы для разработчиков
  resources: {
    documentationUrl: string;
    sdkUrl: string;
    examplesUrl: string;
  };
}
```

---

Система плагинов обеспечивает гибкость и расширяемость CMS, позволяя разработчикам создавать и распространять дополнительные функциональные возможности.
