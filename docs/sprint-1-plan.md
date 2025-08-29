# 🎯 Sprint 1: Укрепление архитектуры (2 недели)

## 📋 Цели спринта

**Основная цель:** Создать твердую основу для дальнейшего развития CMS с современными паттернами разработки.

### 🎯 Ключевые результаты:
1. **Современное управление состоянием** - Redux Toolkit + React Query
2. **Строгая типизация** - централизованная система типов
3. **Оптимизированные компоненты** - производительность и DX
4. **Автоматизированное тестирование** - CI/CD pipeline

---

## 📅 Sprint Backlog

### 🔥 **День 1-2: Настройка Redux Toolkit**

#### Задачи:
```bash
# 1. Установка зависимостей
pnpm add @reduxjs/toolkit react-redux @reduxjs/toolkit-query
pnpm add --save-dev @types/react-redux

# 2. Создание store структуры
mkdir -p frontend/src/store
touch frontend/src/store/index.ts
touch frontend/src/store/hooks.ts
```

#### Файлы для создания:
- `frontend/src/store/index.ts` - основной store
- `frontend/src/store/hooks.ts` - типизированные hooks
- `frontend/src/store/slices/` - папка для slices

#### Реализация:
```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import contentReducer from './slices/contentSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    content: contentReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(/* API middleware */),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

### ⚡ **День 3-4: React Query интеграция**

#### Задачи:
```bash
# Установка React Query
pnpm add @tanstack/react-query @tanstack/react-query-devtools

# Создание API клиента
mkdir -p frontend/src/api
```

#### Создание API слоя:
```typescript
// frontend/src/api/baseApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      // Добавление авторизации
      return headers;
    },
  }),
  endpoints: () => ({}),
  tagTypes: ['Content', 'User', 'Media'],
});
```

#### Конкретные endpoints:
```typescript
// frontend/src/api/contentApi.ts
export const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContent: builder.query({
      query: ({ type, page = 1 }) => `content/${type}?page=${page}`,
      providesTags: ['Content'],
    }),
    createContent: builder.mutation({
      query: ({ type, data }) => ({
        url: `content/${type}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Content'],
    }),
  }),
});
```

---

### 🎨 **День 5-7: Система типов**

#### Задачи:
```bash
# Создание централизованной системы типов
mkdir -p frontend/src/types
touch frontend/src/types/index.ts
touch frontend/src/types/api.ts
touch frontend/src/types/ui.ts
```

#### Типы для API:
```typescript
// frontend/src/types/api.ts
export interface APIResponse<T = any> {
  data: T;
  message?: string;
  status: 'success' | 'error';
  errors?: string[];
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ContentItem {
  id: string;
  type: string;
  title: string;
  content: Record<string, any>;
  status: 'draft' | 'published' | 'archived';
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlockData {
  id: string;
  blockType: string;
  content: Record<string, any>;
  position: number;
  parentBlockId?: string;
  slot?: string;
}
```

#### Типы для UI состояния:
```typescript
// frontend/src/types/ui.ts
export interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebar: {
    open: boolean;
    width: number;
  };
  modals: {
    [key: string]: boolean;
  };
  notifications: Notification[];
  loading: {
    global: boolean;
    components: Record<string, boolean>;
  };
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

---

### 🧪 **День 8-10: Тестирование**

#### Задачи:
```bash
# Установка testing libraries
pnpm add --save-dev @testing-library/react @testing-library/jest-dom
pnpm add --save-dev @testing-library/user-event jsdom

# Настройка Jest
touch frontend/jest.config.js
```

#### Конфигурация Jest:
```javascript
// frontend/jest.config.js
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx)',
  ],
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/main.tsx',
  ],
};
```

#### Setup файл:
```typescript
// frontend/src/test/setup.ts
import '@testing-library/jest-dom';

// Mock для API
global.fetch = jest.fn();

// Mock для localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
});
```

#### Пример теста:
```typescript
// frontend/src/components/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

### 🔧 **День 11-12: Оптимизация компонентов**

#### Задачи:
```bash
# Добавление React DevTools для профилирования
pnpm add --save-dev react-devtools

# Создание утилит для оптимизации
mkdir -p frontend/src/utils
touch frontend/src/utils/performance.ts
```

#### Оптимизация компонентов:
```typescript
// frontend/src/utils/performance.ts
import { memo, useMemo, useCallback } from 'react';

// HOC для оптимизации компонентов
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return memo((props: P) => {
    const startTime = performance.now();

    React.useEffect(() => {
      const endTime = performance.now();
      console.log(`${componentName} render time: ${endTime - startTime}ms`);
    });

    return <Component {...props} />;
  });
}

// Hook для мемоизации тяжелых вычислений
export function useExpensiveCalculation<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  return useMemo(factory, deps);
}

// Hook для оптимизации callbacks
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback(callback, deps);
}
```

#### Применение оптимизаций:
```typescript
// Оптимизация существующего компонента
const OptimizedBlockRenderer = withPerformanceTracking(
  BlockRenderer,
  'BlockRenderer'
);

// Использование в компоненте
const BlockRenderer: React.FC<BlockRendererProps> = memo(({ blocks, ...props }) => {
  const processedBlocks = useExpensiveCalculation(
    () => processBlocks(blocks),
    [blocks]
  );

  const handleBlockClick = useOptimizedCallback(
    (blockId: string) => {
      // Обработка клика
    },
    []
  );

  return (
    <div>
      {processedBlocks.map(block => (
        <BlockComponent
          key={block.id}
          block={block}
          onClick={handleBlockClick}
        />
      ))}
    </div>
  );
});
```

---

### 🚀 **День 13-14: CI/CD и автоматизация**

#### Задачи:
```bash
# Создание GitHub Actions workflow
mkdir -p .github/workflows
touch .github/workflows/ci.yml

# Настройка Prettier и Husky
pnpm add --save-dev prettier husky lint-staged
```

#### GitHub Actions workflow:
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Type checking
        run: pnpm --recursive type-check

      - name: Linting
        run: pnpm lint

      - name: Testing
        run: pnpm test

      - name: Build
        run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: echo "Deploy logic here"
```

#### Pre-commit hooks:
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{js,json,md}": [
      "prettier --write"
    ]
  }
}
```

---

## 📊 Sprint Review

### ✅ Критерии успеха:

1. **Управление состоянием:**
   - [ ] Redux store настроен и работает
   - [ ] React Query интегрирован
   - [ ] Все компоненты используют новый state management

2. **Типизация:**
   - [ ] Централизованная система типов создана
   - [ ] Все API endpoints типизированы
   - [ ] Компоненты имеют strict typing

3. **Тестирование:**
   - [ ] Jest настроен и работает
   - [ ] Минимум 70% покрытия тестами
   - [ ] E2E тесты для критических сценариев

4. **Производительность:**
   - [ ] Компоненты оптимизированы
   - [ ] Bundle size уменьшен на 20%
   - [ ] Lighthouse score > 90

5. **CI/CD:**
   - [ ] GitHub Actions настроен
   - [ ] Pre-commit hooks работают
   - [ ] Автоматическое тестирование проходит

### 📈 Метрики успеха:

- **Performance:** Улучшение времени загрузки на 30%
- **Developer Experience:** Сокращение времени разработки на 20%
- **Code Quality:** 0 линтер ошибок, 70%+ тестовое покрытие
- **Reliability:** 99.9% uptime, <1% error rate

---

## 🎯 Следующие шаги

После завершения Sprint 1:

### **Sprint 2: UI/UX улучшения**
1. **Интеграция новой UI библиотеки** (`@my-forum/ui`)
2. **Улучшение редактора** с контейнерами и слотами
3. **Создание дашборда аналитики**

### **Sprint 3: Backend расширение**
1. **Оптимизация API** с кешированием
2. **Система пользователей и прав**
3. **Мультимедиа менеджер**

---

## 💡 Рекомендации по реализации

### **Порядок выполнения:**
1. **Начать с Redux Toolkit** - это фундамент для всего остального
2. **Параллельно делать типы** - они понадобятся везде
3. **Тестирование добавлять постепенно** - начиная с критических компонентов
4. **CI/CD настроить рано** - чтобы не накапливать технический долг

### **Риски и mitigation:**
- **Сложность миграции:** Делать поэтапно, компонент за компонентом
- **Breaking changes:** Создавать feature flags для плавного перехода
- **Performance regression:** Профилировать на каждом шаге

### **Best practices:**
- **Code reviews:** Обязательно для всех изменений
- **Documentation:** Обновлять по ходу работы
- **Communication:** Ежедневные standups для команды
- **Incremental approach:** Маленькие, но частые релизы

---

**Sprint 1 создаст твердую основу для всех будущих улучшений!** 🚀

Готовы начать? Давайте начнем с настройки Redux Toolkit! 🎯
