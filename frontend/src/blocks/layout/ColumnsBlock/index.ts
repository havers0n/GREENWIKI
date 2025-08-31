// Основной экспорт ColumnsBlock

// UI компоненты
export { default as ColumnsBlock } from './ui/ColumnsBlock';
export { default as ColumnsBlockEditor } from './ui/ColumnsBlockEditor';

// Логика
export { useColumnsStyles, useColumnSlots } from './model/useColumnsLogic';

// Типы
export type {
  ColumnsProps,
  ColumnsEditorProps,
  ColumnsData,
  ColumnsLayout,
  ColumnsGap,
  ColumnChild
} from './types';
