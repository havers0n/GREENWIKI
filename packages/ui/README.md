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
### Button
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

### Input
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

### Modal
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
