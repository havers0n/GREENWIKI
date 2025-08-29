# 👥 Система пользователей и прав доступа CMS

## Обзор

Многоуровневая система управления пользователями с ролевой моделью и детализированными правами доступа.

## 🏗️ Архитектура

### Модель пользователей

```typescript
interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;

  // Статус
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: Date;

  // Роли и права
  roles: Role[];
  permissions: Permission[];

  // Метаданные
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}
```

### Ролевая модель

```typescript
enum SystemRole {
  SUPER_ADMIN = 'super_admin',     // Полный доступ ко всему
  ADMIN = 'admin',                 // Администрирование системы
  EDITOR = 'editor',               // Редактирование контента
  AUTHOR = 'author',               // Создание контента
  CONTRIBUTOR = 'contributor',     // Ограниченное редактирование
  REVIEWER = 'reviewer',           // Проверка и одобрение контента
  VIEWER = 'viewer'                // Только просмотр
}

interface Role {
  id: string;
  name: string;
  description: string;
  systemRole: SystemRole;

  // Права роли
  permissions: Permission[];

  // Области действия
  scope: RoleScope;

  // Наследование ролей
  inherits: string[]; // ID родительских ролей
}
```

### Права доступа

```typescript
enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  PUBLISH = 'publish',
  APPROVE = 'approve',
  MANAGE = 'manage'
}

enum ResourceType {
  CONTENT = 'content',
  USER = 'user',
  ROLE = 'role',
  TEMPLATE = 'template',
  MEDIA = 'media',
  SETTING = 'setting',
  PLUGIN = 'plugin',
  WORKFLOW = 'workflow'
}

interface Permission {
  id: string;
  resourceType: ResourceType;
  resourceId?: string; // Для конкретных ресурсов, или null для всех
  action: PermissionAction;

  // Условия применения
  conditions?: PermissionCondition[];
}

interface PermissionCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'contains';
  value: any;
}
```

## 🔐 Аутентификация

### JWT токены

```typescript
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}
```

### Стратегии аутентификации

```typescript
enum AuthStrategy {
  LOCAL = 'local',           // Email + пароль
  GOOGLE = 'google',         // Google OAuth
  GITHUB = 'github',         // GitHub OAuth
  MICROSOFT = 'microsoft',   // Microsoft OAuth
  SAML = 'saml',             // SAML SSO
  LDAP = 'ldap'              // LDAP/Active Directory
}

interface AuthConfig {
  strategies: AuthStrategy[];
  jwtSecret: string;
  jwtExpiration: string;
  refreshTokenExpiration: string;
}
```

## 🎯 Авторизация

### Проверка прав доступа

```typescript
class AuthorizationService {
  // Проверка конкретного права
  hasPermission(user: User, action: PermissionAction, resourceType: ResourceType, resourceId?: string): boolean

  // Проверка роли
  hasRole(user: User, role: SystemRole): boolean

  // Получение всех прав пользователя
  getUserPermissions(user: User): Permission[]

  // Проверка доступа к ресурсу с учетом условий
  checkAccess(user: User, action: PermissionAction, resource: any): boolean
}
```

### Примеры прав

```typescript
// Админ может управлять всеми пользователями
{
  resourceType: ResourceType.USER,
  action: PermissionAction.MANAGE,
  conditions: []
}

// Редактор может редактировать только свои посты
{
  resourceType: ResourceType.CONTENT,
  action: PermissionAction.UPDATE,
  conditions: [
    { field: 'author_id', operator: 'eq', value: '{{user.id}}' }
  ]
}

// Модератор может одобрять контент в своей категории
{
  resourceType: ResourceType.CONTENT,
  action: PermissionAction.APPROVE,
  conditions: [
    { field: 'category', operator: 'in', value: '{{user.allowed_categories}}' }
  ]
}
```

## 👥 Управление пользователями

### Регистрация и активация

```typescript
interface RegistrationFlow {
  // Шаги регистрации
  steps: RegistrationStep[];

  // Требования к паролю
  passwordPolicy: PasswordPolicy;

  // Email верификация
  emailVerification: boolean;

  // Автоматическая роль после регистрации
  defaultRole: SystemRole;
}

enum RegistrationStep {
  EMAIL = 'email',
  PASSWORD = 'password',
  PROFILE = 'profile',
  VERIFICATION = 'verification'
}
```

### Профиль пользователя

```typescript
interface UserProfile {
  // Базовая информация
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;

  // Контактная информация
  phone?: string;
  website?: string;
  socialLinks: SocialLink[];

  // Настройки
  preferences: UserPreferences;

  // Статистика
  stats: UserStats;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  dashboard: DashboardConfig;
}
```

## 🔄 Рабочие процессы (Workflows)

### Система одобрения контента

```typescript
interface Workflow {
  id: string;
  name: string;
  description: string;

  // Этапы workflow
  steps: WorkflowStep[];

  // Условия запуска
  triggers: WorkflowTrigger[];
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'review' | 'approval' | 'publish' | 'notification';

  // Кто может выполнять шаг
  assignees: WorkflowAssignee[];

  // Условия перехода к следующему шагу
  conditions: WorkflowCondition[];

  // Действия при выполнении шага
  actions: WorkflowAction[];
}

interface WorkflowAssignee {
  type: 'role' | 'user' | 'group';
  value: string;
}
```

### Пример workflow для публикации

```typescript
const contentPublicationWorkflow: Workflow = {
  name: 'Публикация контента',
  steps: [
    {
      name: 'Создание черновика',
      type: 'review',
      assignees: [{ type: 'role', value: 'author' }]
    },
    {
      name: 'Проверка редактором',
      type: 'approval',
      assignees: [{ type: 'role', value: 'editor' }],
      conditions: [
        {
          field: 'content.length',
          operator: 'gt',
          value: 100
        }
      ]
    },
    {
      name: 'Одобрение администратором',
      type: 'approval',
      assignees: [{ type: 'role', value: 'admin' }]
    },
    {
      name: 'Публикация',
      type: 'publish',
      actions: [
        { type: 'publish_content' },
        { type: 'send_notification', template: 'content_published' }
      ]
    }
  ]
};
```

## 📊 Аудит и логирование

### Система аудита

```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  action: AuditAction;
  resourceType: ResourceType;
  resourceId: string;

  // Детали действия
  details: AuditDetails;

  // IP адрес и User Agent
  ipAddress: string;
  userAgent: string;

  // Результат действия
  success: boolean;
  errorMessage?: string;
}

enum AuditAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  PUBLISH = 'publish',
  APPROVE = 'approve',
  REJECT = 'reject',
  PERMISSION_CHANGE = 'permission_change'
}
```

### Мониторинг активности

```typescript
interface UserActivity {
  userId: string;
  date: Date;
  actions: {
    login: number;
    content_created: number;
    content_edited: number;
    content_published: number;
  };
  session_duration: number;
  last_active: Date;
}
```

## 🔒 Безопасность

### Защита от распространенных уязвимостей

```typescript
interface SecurityConfig {
  // Защита от brute force
  rateLimiting: {
    maxAttempts: number;
    windowMs: number;
    blockDuration: number;
  };

  // Защита от CSRF
  csrfProtection: boolean;

  // Защита от XSS
  contentSanitization: boolean;

  // CORS политика
  corsPolicy: CORSPolicy;

  // Заголовки безопасности
  securityHeaders: SecurityHeaders;
}
```

### Многофакторная аутентификация

```typescript
interface MFAConfig {
  enabled: boolean;
  methods: MFAMethod[];
  required: boolean;
}

enum MFAMethod {
  TOTP = 'totp',           // Google Authenticator
  SMS = 'sms',             // SMS коды
  EMAIL = 'email',         // Email коды
  HARDWARE_KEY = 'hardware' // YubiKey, etc.
}
```

## 🎨 Пользовательский интерфейс

### Панель администратора

```
📊 Dashboard
├── 👤 Users Management
│   ├── 📋 User List
│   ├── ➕ Add User
│   ├── 👥 Roles & Permissions
│   └── 📈 User Activity
├── 🔐 Security
│   ├── 🛡️ Access Control
│   ├── 📝 Audit Logs
│   └── ⚙️ Security Settings
└── ⚙️ System Settings
    ├── 🔧 General Settings
    ├── 🎨 Themes
    └── 🔌 Plugins
```

### Профиль пользователя

```typescript
interface ProfileSettings {
  sections: ProfileSection[];

  // Доступные действия
  actions: ProfileAction[];
}

interface ProfileSection {
  id: string;
  title: string;
  icon: string;
  component: React.ComponentType;

  // Права доступа к секции
  requiredPermissions: Permission[];
}
```

## 🚀 API для управления пользователями

### REST API Endpoints

```typescript
// Пользователи
GET    /api/users
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id

// Роли
GET    /api/roles
POST   /api/roles
PUT    /api/roles/:id
DELETE /api/roles/:id

// Права
GET    /api/permissions
POST   /api/permissions
DELETE /api/permissions/:id

// Аутентификация
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me

// Профиль
GET    /api/profile
PUT    /api/profile
PUT    /api/profile/avatar
PUT    /api/profile/password
```

### GraphQL Schema

```graphql
type Query {
  users(filter: UserFilter, pagination: Pagination): UserConnection
  user(id: ID!): User
  currentUser: User
  roles: [Role]
  permissions: [Permission]
}

type Mutation {
  createUser(input: CreateUserInput!): User
  updateUser(id: ID!, input: UpdateUserInput!): User
  deleteUser(id: ID!): Boolean

  assignRole(userId: ID!, roleId: ID!): Boolean
  revokeRole(userId: ID!, roleId: ID!): Boolean

  createRole(input: CreateRoleInput!): Role
  updateRole(id: ID!, input: UpdateRoleInput!): Role
}
```

## 📱 Интеграции

### Внешние сервисы аутентификации

```typescript
interface OAuthConfig {
  provider: AuthStrategy;
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  scopes: string[];
}

interface SAMLConfig {
  entryPoint: string;
  issuer: string;
  cert: string;
  privateKey: string;
}
```

### Webhooks для внешних систем

```typescript
interface WebhookConfig {
  url: string;
  events: string[];
  secret: string;
  headers: Record<string, string>;
}

enum UserEvent {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_LOGIN = 'user.login',
  ROLE_ASSIGNED = 'role.assigned',
  PERMISSION_GRANTED = 'permission.granted'
}
```

## 📊 Аналитика и отчеты

### Отчеты по пользователям

```typescript
interface UserReport {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  usersByRole: Record<SystemRole, number>;
  topActiveUsers: Array<{
    user: User;
    activityCount: number;
  }>;
}
```

### Метрики безопасности

```typescript
interface SecurityMetrics {
  failedLoginAttempts: number;
  blockedIPs: string[];
  suspiciousActivities: SecurityEvent[];
  passwordResets: number;
}
```

---

Эта система обеспечивает комплексное управление пользователями и правами доступа, поддерживая различные сценарии использования от простых блогов до крупных корпоративных систем.
