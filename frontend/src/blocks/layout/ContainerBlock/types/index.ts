// Типы для ContainerBlock
import type { ReactNode, CSSProperties } from 'react';

// Импортируем BlockNode для использования в типах
import type { BlockNode } from '../../../../types/api';

export type ContainerLayout = 'vertical' | 'horizontal' | 'grid';
export type ContainerGap = 'none' | 'small' | 'medium' | 'large';
export type ContainerPadding = 'none' | 'small' | 'medium' | 'large';

// Базовые props для всех Container компонентов
export interface BaseContainerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

// Props для чистого UI компонента
export interface ContainerProps extends BaseContainerProps {
  // Layout
  layout?: ContainerLayout;
  gap?: ContainerGap;
  padding?: ContainerPadding;

  // Styling
  backgroundColor?: string;
  borderRadius?: string;
  maxWidth?: string;

  // Title
  title?: string;

  // D&D support
  droppableId?: string;
  isDropDisabled?: boolean;

  // CMS-specific
  blockId?: string;
}

// Props для редактора
export interface ContainerEditorProps extends ContainerProps {
  // Editor-specific props
  editorMode?: boolean;
  allBlocks?: BlockNode[];
  selectedBlockId?: string | null;
  onSelectBlock?: (id: string | null) => void;
  onUpdateBlock?: (block: BlockNode) => void;
  onUpdateContent?: (content: unknown) => void;
}

// Используем BlockNode из глобальных типов вместо локального ChildBlock
export type ChildBlock = BlockNode;

// Типы для стилизации
export interface ContainerStyles {
  display: 'flex' | 'grid' | 'block';
  flexDirection?: 'row' | 'column';
  gridTemplateColumns?: string;
  gap: string;
  padding: string;
  backgroundColor: string;
  borderRadius: string;
  maxWidth?: string;
  margin?: string;
}

// Utility types
export type GapValue = Record<ContainerGap, string>;
export type PaddingValue = Record<ContainerPadding, string>;
