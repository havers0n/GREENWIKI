// Основной экспорт ContainerBlock

// UI компоненты
export { ContainerBlock } from './ui/ContainerBlock';
export { ContainerBlockEditor } from './ui/ContainerBlockEditor';

// Логика
export { useContainerLogic, useContainerStyles, useContainerDroppable } from './model/useContainerLogic';

// Типы
export type {
  ContainerProps,
  ContainerEditorProps,
  ContainerLayout,
  ContainerGap,
  ContainerPadding,
  ChildBlock,
  ContainerStyles,
  BaseContainerProps
} from './types';

// Переэкспорт для удобства
export { ContainerBlock as default } from './ui/ContainerBlock';

// Алиасы для обратной совместимости
export { ContainerBlock as ContainerSection } from './ui/ContainerBlock';
export { ContainerBlockEditor as ContainerSectionEditor } from './ui/ContainerBlockEditor';
