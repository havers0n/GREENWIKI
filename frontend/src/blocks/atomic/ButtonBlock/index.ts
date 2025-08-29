// Основной экспорт ButtonBlock

// UI компоненты
export { ButtonBlock } from './ui/ButtonBlock';
export { ButtonBlockEditor } from './ui/ButtonBlockEditor';
export { ButtonLink } from './ui/ButtonLink';

// Хуки
export { useButtonBlockLogic } from './model/useButtonBlockLogic';
export { useButtonBlockStyles } from './model/useButtonBlockStyles';

// Типы
export type {
  ButtonBlockProps,
  ButtonBlockEditorProps,
  ButtonBlockMetadata,
  ButtonVariant,
  ButtonSize,
  LinkConfig,
  LinkType,
  UseButtonBlockLogicResult,
  UseButtonBlockStylesResult
} from './types';

// Переэкспорт для удобства
export { ButtonBlock as default } from './ui/ButtonBlock';
