// Новый рефакторированный ContextualInspector
// Экспорты всех компонентов и хуков

// Основной компонент
export { ContextualInspectorNew as ContextualInspector } from './ui/ContextualInspectorNew';

// UI компоненты
export { InspectorHeader } from './ui/InspectorHeader';
export { BlockInfo } from './ui/BlockInfo';
export { BlockNavigation } from './ui/BlockNavigation';
export { BlockContentEditor } from './ui/BlockContentEditor';
export { BlockDesignEditor } from './ui/BlockDesignEditor';
export { BlockActions } from './ui/BlockActions';

// Хуки
export {
  useInspectorLogic,
  useBlockIcon,
  useBlockMetadata
} from './model/useInspectorLogic';
export { useBlockNavigation, useKeyboardNavigation } from './model/useBlockNavigation';

// Типы
export type {
  ContextualInspectorProps,
  InspectorHeaderProps,
  BlockInfoProps,
  BlockNavigationProps,
  BlockContentEditorProps,
  BlockDesignEditorProps,
  BlockActionsProps,
  LayoutBlock,
  BlockStatus,
  StatusInfo,
  UseInspectorLogicResult,
  UseBlockNavigationResult
} from './types';

// Переэкспорт для обратной совместимости
export { ContextualInspectorNew as default } from './ui/ContextualInspectorNew';
