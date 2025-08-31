import React from 'react';
import { Input } from '../../atoms/Input';
import { Select } from '../../atoms/Select';
import { Switch } from '../../atoms/Switch';
import { Textarea } from '../../atoms/Textarea';
import { SpacingControl } from '../SpacingControl';
import { EnhancedColorPicker } from '../EnhancedColorPicker';
import { AlignmentControl } from '../AlignmentControl';
import { DimensionControl } from '../DimensionControl';
import { BorderControl } from '../BorderControl';
import { ShadowControl } from '../ShadowControl';
import type { ControlRendererProps, InspectorControl } from './types';

/**
 * ControlRenderer - компонент для рендеринга контролов инспектора
 * на основе декларативной конфигурации
 */
export const ControlRenderer: React.FC<ControlRendererProps> = ({
  control,
  value,
  onChange,
  disabled = false,
}) => {
  const commonProps = {
    disabled: disabled || control.disabled,
  };

  // Рендерим контрол в зависимости от его типа
  switch (control.type) {
    case 'Input':
      const inputControl = control as Extract<InspectorControl, { type: 'Input' }>;
      return (
        <Input
          {...commonProps}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          type={inputControl.inputType || 'text'}
          placeholder={inputControl.placeholder}
          min={inputControl.min}
          max={inputControl.max}
          step={inputControl.step}
          aria-label={inputControl.label}
        />
      );

    case 'Textarea':
      const textareaControl = control as Extract<InspectorControl, { type: 'Textarea' }>;
      return (
        <Textarea
          {...commonProps}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={textareaControl.placeholder}
          rows={textareaControl.rows}
          aria-label={textareaControl.label}
        />
      );

    case 'Select':
      const selectControl = control as Extract<InspectorControl, { type: 'Select' }>;
      return (
        <Select
          {...commonProps}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          aria-label={selectControl.label}
        >
          {selectControl.placeholder && (
            <option value="" disabled>
              {selectControl.placeholder}
            </option>
          )}
          {selectControl.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      );

    case 'Switch':
      return (
        <Switch
          {...commonProps}
          checked={Boolean(value)}
          onChange={onChange}
          aria-label={control.label}
        />
      );

    case 'SpacingControl':
      const spacingControl = control as Extract<InspectorControl, { type: 'SpacingControl' }>;
      return (
        <SpacingControl
          {...commonProps}
          value={value}
          onChange={onChange}
          allowLinked={spacingControl.allowLinked}
        />
      );

    case 'EnhancedColorPicker':
      const colorControl = control as Extract<InspectorControl, { type: 'EnhancedColorPicker' }>;
      return (
        <EnhancedColorPicker
          {...commonProps}
          value={value}
          onChange={onChange}
          showAlpha={colorControl.showAlpha}
          presets={colorControl.presets}
        />
      );

    case 'AlignmentControl':
      const alignmentControl = control as Extract<InspectorControl, { type: 'AlignmentControl' }>;
      return (
        <AlignmentControl
          {...commonProps}
          value={value}
          onChange={onChange}
          size={alignmentControl.size}
        />
      );

    case 'DimensionControl':
      const dimensionControl = control as Extract<InspectorControl, { type: 'DimensionControl' }>;
      return (
        <DimensionControl
          {...commonProps}
          value={value}
          onChange={onChange}
          showConstraints={dimensionControl.showConstraints}
        />
      );

    case 'BorderControl':
      const borderControl = control as Extract<InspectorControl, { type: 'BorderControl' }>;
      return (
        <BorderControl
          {...commonProps}
          value={value}
          onChange={onChange}
          showStyle={borderControl.showStyle}
          showRadius={borderControl.showRadius}
        />
      );

    case 'ShadowControl':
      return (
        <ShadowControl
          {...commonProps}
          value={value}
          onChange={onChange}
        />
      );

    default:
      // Fallback для неизвестных типов
      console.warn(`Unknown control type: ${(control as any).type}`);
      return (
        <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
          Неизвестный тип контрола: {(control as any).type}
        </div>
      );
  }
};
