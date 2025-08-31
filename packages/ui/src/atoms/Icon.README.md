# Icon Component

Универсальный компонент для отображения иконок из библиотеки `lucide-react`. Предоставляет типобезопасный API для работы с иконками.

## Особенности

- ✅ Полная типобезопасность - принимает только React компоненты иконок
- ✅ Централизованное управление стилями иконок
- ✅ Автоматическая поддержка всех пропсов lucide-react
- ✅ Оптимизированная производительность с forwardRef

## API

```typescript
interface IconProps extends LucideProps {
  icon: React.ElementType;  // Компонент иконки из lucide-react
  className?: string;
}
```

## Примеры использования

### Базовое использование

```tsx
import { Icon } from '@my-forum/ui';
import { Mail, Search, Heart } from 'lucide-react';

function MyComponent() {
  return (
    <div>
      <Icon icon={Mail} size={20} />
      <Icon icon={Search} size={16} className="text-blue-500" />
      <Icon icon={Heart} size={24} className="text-red-500" strokeWidth={1} />
    </div>
  );
}
```

### Использование в Button

```tsx
import { Button } from '@my-forum/ui';
import { LogIn, ArrowRight } from 'lucide-react';

function AuthButtons() {
  return (
    <div className="space-x-4">
      <Button leftIcon={LogIn} variant="primary">
        Войти
      </Button>
      <Button rightIcon={ArrowRight} variant="secondary">
        Далее
      </Button>
    </div>
  );
}
```

### Использование в Dropdown

```tsx
import { Dropdown } from '@my-forum/ui';
import { Sun, Moon, Monitor } from 'lucide-react';

const themeOptions = [
  { value: 'light', label: 'Светлая', icon: Sun },
  { value: 'dark', label: 'Темная', icon: Moon },
  { value: 'system', label: 'Системная', icon: Monitor },
];

function ThemeSelector() {
  return (
    <Dropdown
      options={themeOptions}
      placeholder="Выберите тему"
    />
  );
}
```

## Пропсы

| Проп | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `icon` | `React.ElementType` | - | **Обязательный**. Компонент иконки из lucide-react |
| `size` | `number` | `16` | Размер иконки в пикселях |
| `className` | `string` | - | Дополнительные CSS классы |
| `color` | `string` | - | Цвет иконки |
| `strokeWidth` | `number` | - | Толщина линии иконки |

Все остальные пропсы из `LucideProps` также поддерживаются.

## Миграция с прямого использования иконок

### Было (проблемное):
```tsx
// Проблема: TypeScript не может проверить типы
import { Mail } from 'lucide-react';

<Mail className="text-blue-500" size={20} /> // as any неявно используется
```

### Стало (правильное):
```tsx
import { Icon } from '@my-forum/ui';
import { Mail } from 'lucide-react';

<Icon icon={Mail} className="text-blue-500" size={20} /> // Полная типобезопасность
```

## Преимущества нового подхода

1. **Типобезопасность**: TypeScript может проверить, что передается именно компонент иконки
2. **Централизация**: Все иконки используют единый API и стили
3. **Расширяемость**: Легко добавить глобальные стили или поведения для всех иконок
4. **Производительность**: Оптимизированный рендеринг с forwardRef
5. **Поддержка**: Единая точка для обновлений и исправлений

## Интеграция с другими компонентами

Компонент Icon уже интегрирован в следующие компоненты UI-kit:

- `Button` (leftIcon, rightIcon)
- `Dropdown` (иконки опций)
- `InspectorSection` (иконки секций)
- `ThemeToggle` (иконки тем)

Все эти компоненты теперь ожидают `React.ElementType` вместо `React.ReactNode` для иконок.
