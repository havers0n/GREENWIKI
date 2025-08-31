// Типы для ColumnsBlock
import type { ReactNode, CSSProperties } from 'react';
import type { BlockNode } from '../../../../types/api';

export type ColumnsLayout = 'two' | 'three' | 'four';
export type ColumnsGap = 'none' | 'small' | 'medium' | 'large';

// Базовые props для всех Columns компонентов
export interface BaseColumnsProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

// Props для чистого UI компонента
export interface ColumnsProps extends BaseColumnsProps {
  // Layout
  layout?: ColumnsLayout;
  gap?: ColumnsGap;

  // Styling
  backgroundColor?: string;
  borderRadius?: string;

  // CMS-specific
  blockId?: string;
  editorMode?: boolean;
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string | null) => void;
  onUpdateBlock?: (block: BlockNode) => void;

  // Дочерние блоки для рендеринга
  blockTree?: BlockNode[];
}

// Props для редактора
export interface ColumnsEditorProps {
  data: ColumnsData;
  onChange: (data: ColumnsData) => void;
}

// Данные для блока колонок (синхронизировано с blockRegistry)
export interface ColumnsData {
  layout: ColumnsLayout;
}

// Тип для дочернего блока в колонке
export interface ColumnChild {
  slot: string;
  block: BlockNode;
}
