# @my-forum/ui

Набор базовых UI-компонентов для админ‑панели и виджетов CMS. Библиотека ориентирована на:
- единый API пропов (variant/size/disabled/loading/a11y)
- согласованность стилей через CSS‑переменные и токены
- совместимость с существующим фронтендом через шлюз `shared/ui`

## Установка и подключение
Пакет уже подключён как workspace‑зависимость. Для сборки:
```
pnpm --filter @my-forum/ui build
```
Импортировать компоненты рекомендуется из `shared/ui` (для совместимости), но можно и напрямую:
```ts
import { Button, Input, Modal } from '@my-forum/ui'
```

## Токены и переменные
Компоненты используют CSS‑переменные, определённые во фронтенде (`frontend/src/app/styles/index.css`):
- `--color-majestic-pink`, `--color-majestic-dark`
- `--color-majestic-gray-{100|200|300|400}`
- `--status-{red|green|blue}`

Сводка токенов пакета — `packages/ui/tokens/tokens.json`. Значения токенов маппятся на CSS‑переменные (var(...)), что позволяет централизованно менять тему без правок компонентов.

## Компоненты

### Новые компоненты для CMS

#### FormField
Обертка для полей формы с лейблом, подсказкой и ошибками:
```ts
interface FormFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  id?: string;
}
```

#### Progress
Компонент прогресс-бара:
```ts
interface ProgressProps {
  value: number; // 0-100
  max?: number;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
}
```

#### Dropdown
Улучшенный селект с поиском и множественным выбором:
```ts
interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
  onChange: (value: string | string[]) => void;
  renderOption?: (option: DropdownOption) => React.ReactNode;
}
```

#### Toast
Система уведомлений:
```ts
const { success, error, warning, info } = useToast();

// Использование
success('Данные сохранены!');
error('Ошибка при сохранении');
```

#### Pagination
Компонент пагинации:
```ts
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxVisiblePages?: number;
}
```

#### FileUpload
Загрузчик файлов с drag & drop:
```ts
interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
  dragAndDrop?: boolean;
}
```

### Базовые компоненты

#### Button
```ts
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}
```
- Состояния: `disabled`, `loading` (добавляет `aria-busy` и блокирует кнопку)
- Размеры: `xs|sm|md|lg` (поддержка `xs` для обратной совместимости)
- Иконки: `leftIcon/rightIcon` (не участвуют в доступности — `aria-hidden`)

#### Input
```ts
export type InputSize = 'sm' | 'md' | 'lg'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  hint?: string
  error?: string
  invalid?: boolean
  size?: InputSize
  containerClassName?: string
}
```
- Доступность: `aria-invalid`, `aria-describedby`, обязательные поля помечаются `required` + визуальный индикатор
- Размеры: `sm|md|lg`

#### Modal
```ts
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

interface ModalProps {
  title: string
  children: React.ReactNode
  onClose: () => void
  className?: string
  isOpen?: boolean // по умолчанию true (для обратной совместимости)
  size?: ModalSize
  closeOnEscape?: boolean // по умолчанию true
  closeOnOverlay?: boolean // по умолчанию true
}
```
- Роли/ARIA: `role="dialog"`, `aria-modal`, `aria-labelledby`
- Закрытие: по `Escape` и клику по оверлею (настраивается)

## Совместимость
- `shared/ui` реэкспортирует `Button`, `Input`, `Modal` из `@my-forum/ui`, чтобы не менять существующие импорты
- `Modal.isOpen` сделан необязательным (дефолт `true`)
- `Button` поддерживает `size="xs"`

## Версионирование
- Семантические версии: минор/патч — добавления/фиксы без ломки, major — изменения API

## Разработка
- Типы: TypeScript, строгий режим
- Сборка: `tsc -p tsconfig.json` → `dist/`
- Перед изменениями компонентов — согласуйте добавление новых токенов или вариантов с дизайном/темой
