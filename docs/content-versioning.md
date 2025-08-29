# 📝 Система версионирования контента CMS

## Обзор

Комплексная система версионирования контента с поддержкой откатов, сравнения версий и совместной работы.

## 🏗️ Архитектура версионирования

### Модель версий

```typescript
interface ContentVersion {
  id: string;
  contentId: string;

  // Метаданные версии
  version: number;
  label?: string; // Человекопонятное название версии
  description?: string;

  // Содержимое
  data: any; // Сериализованное содержимое контента
  metadata: Record<string, any>; // Метаданные (автор, дата, etc.)

  // Связи
  parentVersionId?: string; // ID родительской версии
  createdBy: string; // ID пользователя
  createdAt: Date;

  // Статус
  isPublished: boolean;
  isDraft: boolean;

  // Хеш для обнаружения изменений
  contentHash: string;
  diffHash?: string; // Хеш изменений относительно предыдущей версии
}
```

### Стратегия версионирования

```typescript
enum VersioningStrategy {
  LINEAR = 'linear',         // Последовательные версии (1, 2, 3, ...)
  TREE = 'tree',            // Древовидная структура с ветвями
  SNAPSHOT = 'snapshot',    // Только снимки состояния
  EVENT_SOURCING = 'event_sourcing' // Версионирование через события
}

interface VersioningConfig {
  strategy: VersioningStrategy;
  maxVersions: number; // Максимальное количество версий
  autoSave: boolean; // Автоматическое сохранение черновиков
  autoSaveInterval: number; // Интервал автосохранения в секундах
}
```

## 🔄 Создание и управление версиями

### Автоматическое версионирование

```typescript
class VersionManager {
  // Создание новой версии
  async createVersion(contentId: string, data: any, userId: string): Promise<ContentVersion>

  // Автосохранение черновика
  async autoSave(contentId: string, data: any, userId: string): Promise<ContentVersion>

  // Публикация версии
  async publishVersion(versionId: string): Promise<ContentVersion>

  // Откат к версии
  async revertToVersion(contentId: string, versionId: string): Promise<Content>
}
```

### Ручное управление версиями

```typescript
interface VersionControl {
  // Создание именованной версии
  createNamedVersion(contentId: string, name: string, description?: string): Promise<ContentVersion>

  // Создание ветви
  createBranch(contentId: string, branchName: string, fromVersionId: string): Promise<ContentVersion>

  // Слияние ветвей
  mergeBranches(sourceVersionId: string, targetVersionId: string): Promise<ContentVersion>

  // Тэгирование версий
  tagVersion(versionId: string, tag: string): Promise<void>
}
```

## 📊 Сравнение версий

### Diff система

```typescript
interface ContentDiff {
  versionId: string;
  previousVersionId?: string;

  // Изменения по полям
  fieldChanges: FieldChange[];

  // Статистика изменений
  stats: DiffStats;

  // HTML представление различий
  diffHtml?: string;
}

interface FieldChange {
  field: string;
  type: 'added' | 'removed' | 'modified';
  oldValue?: any;
  newValue?: any;
  diff?: string; // Подробное сравнение для текста
}

interface DiffStats {
  fieldsChanged: number;
  additions: number;
  deletions: number;
  totalChanges: number;
}
```

### Визуализация различий

```typescript
class DiffVisualizer {
  // Генерация HTML с выделенными изменениями
  generateDiffHtml(oldContent: any, newContent: any): string

  // Генерация JSON diff
  generateJsonDiff(oldData: any, newData: any): ContentDiff

  // Получение сводки изменений
  getDiffSummary(diff: ContentDiff): DiffSummary
}
```

## 🔄 Откат и восстановление

### Стратегии отката

```typescript
enum RollbackStrategy {
  SOFT = 'soft',           // Создание новой версии с откатом
  HARD = 'hard',           // Перезапись текущей версии
  BRANCH = 'branch'        // Создание новой ветви с откатом
}

interface RollbackOptions {
  strategy: RollbackStrategy;
  createBackup: boolean;
  notifyUsers: boolean;
  reason?: string;
}
```

### Процесс отката

```typescript
class RollbackManager {
  async rollback(contentId: string, targetVersionId: string, options: RollbackOptions): Promise<Content> {
    // 1. Создание резервной копии текущей версии
    if (options.createBackup) {
      await this.createBackupVersion(contentId);
    }

    // 2. Получение целевой версии
    const targetVersion = await this.getVersion(targetVersionId);

    // 3. Применение отката в зависимости от стратегии
    switch (options.strategy) {
      case RollbackStrategy.SOFT:
        return await this.softRollback(contentId, targetVersion);
      case RollbackStrategy.HARD:
        return await this.hardRollback(contentId, targetVersion);
      case RollbackStrategy.BRANCH:
        return await this.branchRollback(contentId, targetVersion);
    }
  }
}
```

## 👥 Совместная работа

### Управление конфликтами

```typescript
interface MergeConflict {
  field: string;
  currentValue: any;
  incomingValue: any;
  baseValue: any;
  resolution?: ConflictResolution;
}

enum ConflictResolution {
  USE_CURRENT = 'use_current',
  USE_INCOMING = 'use_incoming',
  USE_BASE = 'use_base',
  MANUAL = 'manual'
}
```

### Блокировка контента

```typescript
interface ContentLock {
  contentId: string;
  userId: string;
  lockType: 'edit' | 'publish' | 'delete';
  expiresAt: Date;
  reason?: string;
}

class ContentLocker {
  // Блокировка контента
  async lock(contentId: string, userId: string, lockType: LockType): Promise<ContentLock>

  // Снятие блокировки
  async unlock(contentId: string, userId: string): Promise<void>

  // Проверка блокировки
  async isLocked(contentId: string, lockType?: LockType): Promise<boolean>

  // Получение информации о блокировке
  async getLockInfo(contentId: string): Promise<ContentLock | null>
}
```

## 🎯 Временные версии (Time Travel)

### Архив версий

```typescript
interface VersionArchive {
  contentId: string;
  archivedAt: Date;

  // Снимок всех версий на момент архивации
  versions: ContentVersion[];

  // Метаданные архива
  reason: string;
  archivedBy: string;

  // Восстановление
  restoredAt?: Date;
  restoredBy?: string;
}
```

### Временные запросы

```typescript
class TimeTravel {
  // Получение контента на определенную дату
  async getContentAtDate(contentId: string, date: Date): Promise<Content>

  // Получение версии на определенную дату
  async getVersionAtDate(contentId: string, date: Date): Promise<ContentVersion>

  // История изменений за период
  async getChangeHistory(contentId: string, from: Date, to: Date): Promise<ContentDiff[]>
}
```

## 🔍 Поиск и фильтрация версий

### Фильтры версий

```typescript
interface VersionFilter {
  // По автору
  author?: string;

  // По дате
  dateFrom?: Date;
  dateTo?: Date;

  // По статусу
  status?: 'draft' | 'published' | 'archived';

  // По метке
  label?: string;

  // По содержимому
  contentContains?: string;

  // По изменениям
  hasChangesIn?: string[]; // Список полей
}
```

### Поиск версий

```typescript
class VersionSearch {
  // Поиск версий по фильтру
  async searchVersions(contentId: string, filter: VersionFilter): Promise<ContentVersion[]>

  // Полнотекстовый поиск в версиях
  async searchInVersions(contentId: string, query: string): Promise<SearchResult[]>

  // Поиск версий с определенными изменениями
  async findVersionsWithChanges(contentId: string, field: string, oldValue: any, newValue: any): Promise<ContentVersion[]>
}
```

## 📊 Аналитика версий

### Статистика версий

```typescript
interface VersionStats {
  totalVersions: number;
  publishedVersions: number;
  draftVersions: number;

  // Активность по авторам
  authorStats: Record<string, AuthorStats>;

  // Частота изменений
  changeFrequency: ChangeFrequency;

  // Размер хранилища версий
  storageSize: number;
}

interface AuthorStats {
  authorId: string;
  versionsCreated: number;
  lastActivity: Date;
  averageChangesPerVersion: number;
}
```

### Отчеты по версиям

```typescript
class VersionAnalytics {
  // Получение статистики для контента
  async getContentStats(contentId: string): Promise<VersionStats>

  // Анализ паттернов изменений
  async analyzeChangePatterns(contentId: string): Promise<ChangePattern[]>

  // Рекомендации по оптимизации
  async getOptimizationSuggestions(contentId: string): Promise<OptimizationSuggestion[]>
}
```

## 🗄️ Хранение и оптимизация

### Стратегии хранения

```typescript
enum StorageStrategy {
  FULL = 'full',           // Полное хранение всех версий
  DIFF = 'diff',           // Хранение только различий
  SNAPSHOT = 'snapshot',   // Периодические снимки
  COMPRESSED = 'compressed' // Сжатие старых версий
}

interface StorageConfig {
  strategy: StorageStrategy;
  retentionPeriod: number; // Период хранения в днях
  maxVersions: number;
  compressionThreshold: number; // Порог сжатия по количеству версий
}
```

### Очистка старых версий

```typescript
class VersionCleanup {
  // Автоматическая очистка по расписанию
  async cleanupOldVersions(config: StorageConfig): Promise<CleanupResult>

  // Архивация редко используемых версий
  async archiveVersions(contentId: string, beforeDate: Date): Promise<number>

  // Оптимизация хранилища
  async optimizeStorage(): Promise<OptimizationResult>
}
```

## 🔗 Интеграция с Git

### Git-подобный workflow

```typescript
class GitIntegration {
  // Импорт контента из Git репозитория
  async importFromGit(repoUrl: string, contentType: string): Promise<Content[]>

  // Экспорт версий в Git
  async exportToGit(contentId: string, repoUrl: string): Promise<void>

  // Синхронизация с Git репозиторием
  async syncWithGit(contentId: string, repoUrl: string): Promise<SyncResult>
}
```

### Git-подобные команды

```typescript
interface GitLikeCommands {
  // Создание коммита
  commit(message: string): Promise<ContentVersion>

  // Просмотр истории
  log(options?: LogOptions): Promise<CommitInfo[]>

  // Создание ветки
  branch(name: string): Promise<string>

  // Слияние веток
  merge(source: string, target: string): Promise<MergeResult>

  // Откат к коммиту
  reset(commitId: string, mode: 'soft' | 'hard'): Promise<void>
}
```

## 🎨 Пользовательский интерфейс

### Панель версий

```
📝 Content Editor
├── 📋 Version History
│   ├── 📊 Timeline View
│   ├── 📈 Diff View
│   ├── 🔄 Compare Versions
│   └── ⏪ Rollback Options
├── 🔀 Branches
│   ├── 🌿 Branch List
│   ├── ➕ Create Branch
│   └── 🔗 Merge Branches
└── ⚙️ Version Settings
    ├── ⏰ Auto-save
    ├── 📏 Max Versions
    └── 💾 Storage Strategy
```

### Визуализация истории

```typescript
interface VersionTimeline {
  versions: TimelineItem[];
  branches: BranchInfo[];
  currentVersion: string;
  publishedVersion?: string;
}

interface TimelineItem {
  version: ContentVersion;
  position: { x: number; y: number };
  connections: string[]; // ID связанных версий
  type: 'commit' | 'merge' | 'branch' | 'tag';
}
```

## 🚨 Обработка ошибок

### Обработка конфликтов слияния

```typescript
class ConflictResolver {
  // Обнаружение конфликтов
  detectConflicts(version1: ContentVersion, version2: ContentVersion): MergeConflict[]

  // Автоматическое разрешение конфликтов
  autoResolve(conflicts: MergeConflict[]): ResolvedConflict[]

  // Ручное разрешение через UI
  resolveManually(conflict: MergeConflict, resolution: ConflictResolution): ResolvedConflict
}
```

### Восстановление после ошибок

```typescript
class RecoveryManager {
  // Восстановление поврежденных версий
  async recoverCorruptedVersion(versionId: string): Promise<ContentVersion>

  // Создание точки восстановления
  async createRecoveryPoint(contentId: string): Promise<string>

  // Восстановление из точки восстановления
  async restoreFromRecoveryPoint(recoveryId: string): Promise<Content>
}
```

## 📡 API для версионирования

### REST API Endpoints

```typescript
// Версии контента
GET    /api/content/:id/versions
POST   /api/content/:id/versions
GET    /api/content/:id/versions/:versionId
DELETE /api/content/:id/versions/:versionId

// Сравнение версий
GET    /api/content/:id/diff/:versionId1/:versionId2

// Откат
POST   /api/content/:id/revert/:versionId

// Ветки
GET    /api/content/:id/branches
POST   /api/content/:id/branches
POST   /api/content/:id/branches/:branchId/merge
```

### WebSocket для реального времени

```typescript
// Реал-тайм обновления версий
interface VersionSocketEvents {
  'version:created': (data: { contentId: string; version: ContentVersion }) => void;
  'version:published': (data: { contentId: string; versionId: string }) => void;
  'conflict:detected': (data: { contentId: string; conflicts: MergeConflict[] }) => void;
}
```

---

Эта система версионирования предоставляет мощные инструменты для управления историей контента, совместной работы и обеспечения целостности данных в CMS.
