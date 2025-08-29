// Интеграционный слой для постепенной миграции на новую UI библиотеку
// Этот файл позволяет плавно перейти от старой системы к новой
import { useMemo } from 'react';

import {
  Button as NewButton,
  Input as NewInput,
  Modal as NewModal,
  Card as NewCard,
  Typography as NewTypography,
  Spinner as NewSpinner,
  Select as NewSelect,
  Textarea as NewTextarea,
  Icon as NewIcon,
  Tag as NewTag,
  Tooltip as NewTooltip,
  Badge as NewBadge,
  Checkbox as NewCheckbox,
  Switch as NewSwitch,
  Radio as NewRadio,
  Progress as NewProgress,
  Dropdown as NewDropdown,
  Toast as NewToast,
  Pagination as NewPagination,
  FileUpload as NewFileUpload,
  ThemeToggle as NewThemeToggle,
  ThemeProvider as NewThemeProvider,
} from '@my-forum/ui';

// Старые компоненты (для обратной совместимости)
import { Button as OldButton } from './atoms/Button';
import { Input as OldInput } from './atoms/Input';
import { Modal as OldModal } from './molecules/Modal';
import { Card as OldCard } from './atoms/Card';
import { Typography as OldTypography } from './atoms/Typography';
import { Spinner as OldSpinner } from './atoms/Spinner';
import { Select as OldSelect } from './atoms/Select';
import { Textarea as OldTextarea } from './atoms/Textarea';
import { Icon as OldIcon } from './atoms/Icon';
import { Tag as OldTag } from './atoms/Tag';
import { Tooltip as OldTooltip } from './atoms/Tooltip';

// Флаги для поэтапной миграции
const MIGRATION_FLAGS = {
  USE_NEW_BUTTON: true,        // ✅ Готово к использованию
  USE_NEW_INPUT: false,        // 🔄 В процессе
  USE_NEW_MODAL: false,        // 🔄 В процессе
  USE_NEW_CARD: false,         // 🔄 В процессе
  USE_NEW_THEME: true,         // ✅ Готово к использованию
  USE_NEW_TYPOGRAPHY: false,   // 🔄 В процессе
  USE_NEW_SPINNER: true,       // ✅ Готово к использованию
} as const;

// Карта соответствия компонентов ключам флагов миграции
const COMPONENT_FLAG_MAP = {
  Button: 'USE_NEW_BUTTON',
  Input: 'USE_NEW_INPUT',
  Modal: 'USE_NEW_MODAL',
  Card: 'USE_NEW_CARD',
  Typography: 'USE_NEW_TYPOGRAPHY',
  Spinner: 'USE_NEW_SPINNER',
} as const;

// Компоненты, которые уже всегда идут из новой библиотеки
const ALWAYS_NEW_COMPONENTS = [
  'Badge',
  'Checkbox',
  'Switch',
  'Radio',
  'Progress',
  'Dropdown',
  'Toast',
  'Pagination',
  'FileUpload',
  'ThemeToggle',
  'ThemeProvider',
] as const;

// Интегрированные компоненты с автоматическим выбором версии
export const Button = MIGRATION_FLAGS.USE_NEW_BUTTON ? NewButton : OldButton;
export const Input = MIGRATION_FLAGS.USE_NEW_INPUT ? NewInput : OldInput;
export const Modal = MIGRATION_FLAGS.USE_NEW_MODAL ? NewModal : OldModal;
export const Card = MIGRATION_FLAGS.USE_NEW_CARD ? NewCard : OldCard;
export const Typography = MIGRATION_FLAGS.USE_NEW_TYPOGRAPHY ? NewTypography : OldTypography;
export const Spinner = MIGRATION_FLAGS.USE_NEW_SPINNER ? NewSpinner : OldSpinner;
export const Select = OldSelect; // Пока используем старую версию
export const Textarea = OldTextarea; // Пока используем старую версию
export const Icon = OldIcon; // Пока используем старую версию
export const Tag = OldTag; // Пока используем старую версию
export const Tooltip = OldTooltip; // Пока используем старую версию

// Новые компоненты (добавляются постепенно)
export const Badge = NewBadge;
export const Checkbox = NewCheckbox;
export const Switch = NewSwitch;
export const Radio = NewRadio;
export const Progress = NewProgress;
export const Dropdown = NewDropdown;
export const Toast = NewToast;
export const Pagination = NewPagination;
export const FileUpload = NewFileUpload;
export const ThemeToggle = NewThemeToggle;
export const ThemeProvider = NewThemeProvider;

// Хуки и утилиты уведомлений
export { useToast, ToastContainer } from '@my-forum/ui';
export type { ToastOptions } from '@my-forum/ui';

// Типы для обратной совместимости
export type {
  ButtonVariant,
  ButtonSize,
  InputProps,
  ModalProps,
  CardProps,
  TypographyProps,
  SpinnerProps,
} from '@my-forum/ui';

// Переэкспорт старых типов для совместимости
export type {
  ButtonVariant as OldButtonVariant,
  ButtonSize as OldButtonSize,
} from './atoms/Button';

// Утилиты для плавной миграции
export const createMigratedComponent = <T extends any>(
  NewComponent: React.ComponentType<T>,
  OldComponent: React.ComponentType<T>,
  migrationKey: keyof typeof MIGRATION_FLAGS
) => {
  return (props: T) => {
    const Component = MIGRATION_FLAGS[migrationKey] ? NewComponent : OldComponent;
    return <Component {...props} />;
  };
};

// Утилитарный хук для статуса миграции UI
export const useNewUI = () => {
  const isUsingNewComponent = (componentName: string): boolean => {
    if ((ALWAYS_NEW_COMPONENTS as readonly string[]).includes(componentName)) {
      return true;
    }
    const flagKey = (COMPONENT_FLAG_MAP as Record<string, keyof typeof MIGRATION_FLAGS | undefined>)[componentName];
    return flagKey ? Boolean(MIGRATION_FLAGS[flagKey]) : false;
  };

  const getMigrationReadyComponents = () => {
    const candidates = [
      ...Object.keys(COMPONENT_FLAG_MAP),
      ...ALWAYS_NEW_COMPONENTS,
    ];
    return candidates.filter((name) => isUsingNewComponent(name));
  };

  // мемоизируем интерфейс, чтобы не создавать функции заново на каждом рендере
  return useMemo(() => ({ isUsingNewComponent, getMigrationReadyComponents }), []);
};

// Пример использования:
/*
// Вместо прямого импорта можно использовать:
import { Button } from 'shared/ui/integration';

// Это автоматически выберет новую или старую версию
// в зависимости от MIGRATION_FLAGS.USE_NEW_BUTTON
*/
