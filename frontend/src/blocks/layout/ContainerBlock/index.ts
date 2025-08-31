// Полный ре-экспорт всех сущностей ContainerBlock

// Типы
export type {
  ContainerProps,
  ContainerEditorProps,
  ContainerLayout,
  ContainerGap,
  ContainerPadding,
  ChildBlock,
  ContainerStyles,
  BaseContainerProps,
  GapValue,
  PaddingValue,
  ContainerEditorProps as ContainerBlockEditorProps
} from './types';

// Хуки
export {
  useContainerLogic,
  useContainerStyles,
  useContainerDroppable
} from './model/useContainerLogic';

// Компоненты
export { ContainerBlock } from './ui/ContainerBlock';
export { ContainerBlockEditor } from './ui/ContainerBlockEditor';

// Default экспорты
export { ContainerBlock as default } from './ui/ContainerBlock';

// Алиасы для обратной совместимости
export { ContainerBlock as ContainerSection } from './ui/ContainerBlock';
export { ContainerBlockEditor as ContainerSectionEditor } from './ui/ContainerBlockEditor';
