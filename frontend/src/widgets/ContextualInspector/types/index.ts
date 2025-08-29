// Типы для ContextualInspector

import type { Database } from '@my-forum/db-types';
import type { BlockNode } from '../../../types/api';

// Расширяем BlockNode для совместимости с ContextualInspector
export interface LayoutBlock extends BlockNode {
  parent_block_id: string | null;
}

export type BlockStatus = 'published' | 'draft' | string;

export type StatusInfo = {
  text: string;
  color: string;
  icon: string;
};

export type BlockIcon = string;

// Базовые props для всех инспектор компонентов
export interface BaseInspectorProps {
  block: LayoutBlock | null;
  isOpen: boolean;
  onClose: () => void;
}

// Props для заголовка инспектора
export interface InspectorHeaderProps {
  block: LayoutBlock;
  onClose: () => void;
}

// Props для информации о блоке
export interface BlockInfoProps {
  block: LayoutBlock;
  statusInfo: StatusInfo;
}

// Props для навигации по блокам
export interface BlockNavigationProps {
  block: LayoutBlock;
  allBlocks: LayoutBlock[];
  onMoveLeft?: (blockId: string) => void;
  onMoveRight?: (blockId: string) => void;
}

// Props для редактора контента
export interface BlockContentEditorProps {
  block: LayoutBlock;
  spec: any; // Из blockRegistry
  data: unknown;
  onBlockChange: (updatedBlock: LayoutBlock) => void;
}

// Props для дизайн редактора
export interface BlockDesignEditorProps {
  block: LayoutBlock;
  metadata: Record<string, unknown>;
  onMetadataChange: (newMetadata: Record<string, unknown>) => void;
}

// Props для панели переопределений
export interface BlockOverridesPanelProps {
  blockId: string;
  isInstance: boolean;
  onSave?: () => void;
  onError?: (error: Error) => void;
}

// Props для панели действий
export interface BlockActionsProps {
  block: LayoutBlock;
  onBlockDelete?: (blockId: string) => void;
  onPublishToggle?: (blockId: string) => Promise<void>;
  publishing?: boolean;
}

// Props для основного компонента
export interface ContextualInspectorProps extends BaseInspectorProps {
  onBlockChange: (updatedBlock: LayoutBlock) => void;
  onPublishToggle?: (blockId: string) => Promise<void>;
  publishing?: boolean;
  onBlockDelete?: (blockId: string) => void;
  // Для хлебных крошек
  allBlocks?: LayoutBlock[];
  // Для перемещения блоков
  onMoveLeft?: (blockId: string) => void;
  onMoveRight?: (blockId: string) => void;
  // Для работы с переопределениями
  blockId?: string; // ID блока в новой системе
}

// Типы для хуков
export interface UseInspectorLogicResult {
  spec: any;
  isInstance: boolean;
  Editor: React.FC<{ data: unknown; onChange: (d: unknown) => void }> | null;
  data: unknown;
  metadata: Record<string, unknown>;
  statusInfo: StatusInfo;
  canMoveLeft: boolean;
  canMoveRight: boolean;
}

export interface UseBlockNavigationResult {
  canMoveLeft: (block: LayoutBlock) => boolean;
  canMoveRight: (block: LayoutBlock) => boolean;
  pageBlocks: LayoutBlock[];
}

// Utility types
export type BlockType =
  | 'header'
  | 'container_section'
  | 'button_group'
  | 'categories_section'
  | 'controls_section'
  | 'properties_section'
  | 'animations_section'
  | 'changelog_section'
  | 'heading'
  | 'paragraph'
  | 'single_image'
  | 'single_button'
  | 'spacer'
  | 'tabs'
  | 'accordion';
