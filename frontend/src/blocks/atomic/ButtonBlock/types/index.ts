// Типы для ButtonBlock
import type { CSSProperties } from 'react';

// Типы из базового Button компонента
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

// Базовые props для всех ButtonBlock компонентов
export interface BaseButtonBlockProps {
  text?: string;
  className?: string;
  style?: CSSProperties;
}

// Props для чистого UI компонента
export interface ButtonBlockProps extends BaseButtonBlockProps {
  // Button properties
  variant?: ButtonVariant;
  size?: ButtonSize;

  // Link properties
  link?: string;
  linkTarget?: '_blank' | '_self' | '_parent' | '_top';

  // Metadata для стилизации
  metadata?: ButtonBlockMetadata;

  // Callbacks
  onClick?: (event: React.MouseEvent) => void;

  // CMS-specific
  blockId?: string;
}

// Метаданные для стилизации кнопки
export interface ButtonBlockMetadata {
  spacing?: {
    marginTop?: string;
    marginRight?: string;
    marginBottom?: string;
    marginLeft?: string;
  };
  border?: {
    width?: string;
    style?: string;
    color?: string;
    radius?: string;
  };
  textColor?: string;
  backgroundColor?: string;
  customClassName?: string;
}

// Типы для обработки ссылок
export type LinkType = 'internal' | 'external' | 'none';

export interface LinkConfig {
  type: LinkType;
  url?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
}

// Типы для хуков
export interface UseButtonBlockLogicResult {
  linkConfig: LinkConfig;
  handleClick: (event: React.MouseEvent) => void;
  isExternalLink: boolean;
  isInternalLink: boolean;
}

export interface UseButtonBlockStylesResult {
  buttonStyles: React.CSSProperties;
  containerClassName: string;
}

// Props для редактора ButtonBlock
export interface ButtonBlockEditorProps extends ButtonBlockProps {
  editorMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

// Utility types
export type ButtonBlockState = 'idle' | 'loading' | 'disabled';