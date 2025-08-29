import React, { useState, useCallback } from 'react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Textarea } from '../atoms/Textarea';
import { Select } from '../atoms/Select';
import { Checkbox } from '../atoms/Checkbox';
import { Switch } from '../atoms/Switch';
import { Radio } from '../atoms/Radio';
import { FormField } from '../atoms/FormField';
import { Dropdown } from '../molecules/Dropdown';
import { FileUpload } from '../molecules/FileUpload';
import { cn } from '../lib/utils';

export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'switch'
  | 'radio'
  | 'file'
  | 'date'
  | 'datetime-local'
  | 'time';

export interface FormFieldConfig {
  name: string;
  type: FormFieldType;
  label?: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
  layout?: {
    width?: string;
    className?: string;
  };
  fileConfig?: {
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
    maxFiles?: number;
  };
}

export interface FormProps {
  fields: FormFieldConfig[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  onChange?: (values: Record<string, any>, fieldName?: string) => void;
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
  disabled?: boolean;
  layout?: 'vertical' | 'horizontal' | 'inline';
  className?: string;
  actionsClassName?: string;
}

export const Form: React.FC<FormProps> = ({
  fields,
  initialValues = {},
  onSubmit,
  onChange,
  submitLabel = 'Сохранить',
  cancelLabel = 'Отмена',
  onCancel,
  loading = false,
  disabled = false,
  layout = 'vertical',
  className,
  actionsClassName,
}) => {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((field: FormFieldConfig, value: any): string | null => {
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return 'Это поле обязательно для заполнения';
    }

    if (!value && !field.required) return null;

    if (field.validation) {
      const { validation } = field;

      if (validation.min !== undefined && value < validation.min) {
        return `Значение должно быть не меньше ${validation.min}`;
      }

      if (validation.max !== undefined && value > validation.max) {
        return `Значение должно быть не больше ${validation.max}`;
      }

      if (validation.minLength !== undefined && String(value).length < validation.minLength) {
        return `Длина должна быть не меньше ${validation.minLength} символов`;
      }

      if (validation.maxLength !== undefined && String(value).length > validation.maxLength) {
        return `Длина должна быть не больше ${validation.maxLength} символов`;
      }

      if (validation.pattern && !new RegExp(validation.pattern).test(String(value))) {
        return 'Неверный формат';
      }

      if (validation.custom) {
        return validation.custom(value);
      }
    }

    return null;
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      const error = validateField(field, values[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [fields, values, validateField]);

  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));

    // Очищаем ошибку при изменении поля
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }

    onChange?.({ ...values, [fieldName]: value }, fieldName);
  }, [values, errors, onChange]);

  const handleFieldBlur = useCallback((fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));

    const field = fields.find(f => f.name === fieldName);
    if (field) {
      const error = validateField(field, values[fieldName]);
      if (error) {
        setErrors(prev => ({ ...prev, [fieldName]: error }));
      }
    }
  }, [fields, values, validateField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormFieldConfig) => {
    const fieldValue = values[field.name];
    const fieldError = errors[field.name];
    const fieldTouched = touched[field.name];
    const showError = fieldTouched && fieldError;

    const commonProps = {
      disabled: disabled || field.disabled,
      placeholder: field.placeholder,
      onChange: (e: any) => {
        if (field.type === 'checkbox' || field.type === 'switch') {
          handleFieldChange(field.name, e.target.checked);
        } else if (field.type === 'file') {
          // Обработка файлов будет через FileUpload компонент
        } else {
          handleFieldChange(field.name, e.target.value);
        }
      },
      onBlur: () => handleFieldBlur(field.name),
    };

    const fieldElement = (() => {
      switch (field.type) {
        case 'textarea':
          return <Textarea {...commonProps} value={fieldValue || ''} />;

        case 'select':
          return (
            <Select
              {...commonProps}
              value={fieldValue || ''}
            >
              {field.options?.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          );

        case 'multiselect':
          return (
            <Dropdown
              {...commonProps}
              multiple
              value={fieldValue || []}
              options={field.options || []}
              onChange={(value) => handleFieldChange(field.name, value)}
            />
          );

        case 'checkbox':
          return (
            <Checkbox
              {...commonProps}
              checked={fieldValue || false}
              label={field.label}
            />
          );

        case 'switch':
          return (
            <Switch
              {...commonProps}
              checked={fieldValue || false}
              label={field.label}
            />
          );

        case 'radio':
          return (
            <div className="space-y-2">
              {field.options?.map(option => (
                <Radio
                  key={option.value}
                  {...commonProps}
                  value={option.value}
                  checked={fieldValue === option.value}
                  label={option.label}
                  name={field.name}
                />
              ))}
            </div>
          );

        case 'file':
          return (
            <FileUpload
              {...field.fileConfig}
              onFilesSelected={(files) => handleFieldChange(field.name, files)}
            />
          );

        default:
          return (
            <Input
              {...commonProps}
              type={field.type}
              value={fieldValue || ''}
            />
          );
      }
    })();

    // Для checkbox и switch лейбл уже включен в компонент
    if (field.type === 'checkbox' || field.type === 'switch') {
      return (
        <FormField
          key={field.name}
          error={showError ? fieldError : undefined}
          hint={field.hint}
          className={field.layout?.className}
          style={{ width: field.layout?.width }}
        >
          {fieldElement}
        </FormField>
      );
    }

    return (
      <FormField
        key={field.name}
        label={field.label}
        error={showError ? fieldError : undefined}
        hint={field.hint}
        required={field.required}
        className={field.layout?.className}
        style={{ width: field.layout?.width }}
      >
        {fieldElement}
      </FormField>
    );
  };

  const layoutClass = {
    vertical: 'space-y-4',
    horizontal: 'grid grid-cols-1 md:grid-cols-2 gap-4',
    inline: 'flex flex-wrap gap-4 items-end',
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      <div className={layoutClass[layout]}>
        {fields.map(renderField)}
      </div>

      {((onSubmit !== undefined && onSubmit !== null) || (onCancel !== undefined && onCancel !== null)) && (
        <div className={cn('flex gap-3 pt-4 border-t', actionsClassName)}>
          {(onSubmit !== undefined && onSubmit !== null) && (
            <Button
              type="submit"
              loading={isSubmitting || loading}
              disabled={disabled}
            >
              {submitLabel}
            </Button>
          )}

          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={disabled || isSubmitting}
            >
              {cancelLabel}
            </Button>
          )}
        </div>
      )}
    </form>
  );
};
