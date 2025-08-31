// Типы для декларативной конфигурационной системы ContextualInspector

export type ControlType =
  | 'SpacingControl'
  | 'EnhancedColorPicker'
  | 'AlignmentControl'
  | 'DimensionControl'
  | 'BorderControl'
  | 'ShadowControl'
  | 'Input'
  | 'Select'
  | 'Switch'
  | 'Textarea';

// Базовый интерфейс для всех контролов
export interface BaseInspectorControl {
  type: ControlType;
  propName: string; // Имя свойства в metadata или content блока
  label: string;
  required?: boolean;
  hint?: string;
  disabled?: boolean;
}

// Специфические интерфейсы для каждого типа контрола
export interface SpacingControlConfig extends BaseInspectorControl {
  type: 'SpacingControl';
  allowLinked?: boolean;
}

export interface EnhancedColorPickerConfig extends BaseInspectorControl {
  type: 'EnhancedColorPicker';
  showAlpha?: boolean;
  presets?: string[];
}

export interface AlignmentControlConfig extends BaseInspectorControl {
  type: 'AlignmentControl';
  size?: 'sm' | 'md';
}

export interface DimensionControlConfig extends BaseInspectorControl {
  type: 'DimensionControl';
  showConstraints?: boolean;
}

export interface BorderControlConfig extends BaseInspectorControl {
  type: 'BorderControl';
  showStyle?: boolean;
  showRadius?: boolean;
}

export interface ShadowControlConfig extends BaseInspectorControl {
  type: 'ShadowControl';
}

export interface InputControlConfig extends BaseInspectorControl {
  type: 'Input';
  inputType?: 'text' | 'number' | 'email' | 'url' | 'password';
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface SelectControlConfig extends BaseInspectorControl {
  type: 'Select';
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export interface SwitchControlConfig extends BaseInspectorControl {
  type: 'Switch';
}

export interface TextareaControlConfig extends BaseInspectorControl {
  type: 'Textarea';
  placeholder?: string;
  rows?: number;
}

// Объединяющий тип для всех контролов
export type InspectorControl =
  | SpacingControlConfig
  | EnhancedColorPickerConfig
  | AlignmentControlConfig
  | DimensionControlConfig
  | BorderControlConfig
  | ShadowControlConfig
  | InputControlConfig
  | SelectControlConfig
  | SwitchControlConfig
  | TextareaControlConfig;

// Интерфейс для секции инспектора
export interface InspectorSectionConfig {
  title: string;
  description?: string;
  icon?: string;
  controls: InspectorControl[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

// Полная конфигурация инспектора для блока
export type BlockInspectorConfig = InspectorSectionConfig[];

// Тип для реестра конфигураций
export type InspectorRegistry = Record<string, BlockInspectorConfig>;

// Типы для данных блока
export interface BlockData {
  content?: Record<string, any>;
  metadata?: Record<string, any>;
}

// Пропы для ControlRenderer
export interface ControlRendererProps {
  control: InspectorControl;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}
