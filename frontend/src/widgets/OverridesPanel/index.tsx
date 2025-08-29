import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Typography, Button, Input, Textarea, Spinner } from 'shared/ui/atoms';
import { Card } from 'shared/ui/atoms';
import {
  selectBlockWithEffectiveContent,
  selectBlockOriginalContent,
  selectBlockOverrides,
  selectIsBlockInstance
} from '../../store/selectors/blockSelectors';
import { useAppSelector } from '../../store/hooks';
import {
  setBlockOverride,
  removeBlockOverride,
  clearBlockOverrides
} from '../../store/slices/contentSlice';
import {
  updateBlockInstanceOverrides,
  getBlockInstanceOverrides
} from '../../shared/api/blockInstances';
import {
  mergeOverrides,
  getNestedProperty,
  hasOverride,
  removeOverride
} from '../../shared/lib/utils';

interface OverridesPanelProps {
  blockId: string;
  onSave?: () => void;
  onError?: (error: string) => void;
}

interface OverrideField {
  path: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'color' | 'boolean';
  originalValue: any;
  currentValue: any;
  hasOverride: boolean;
}

const OverridesPanel: React.FC<OverridesPanelProps> = ({
  blockId,
  onSave,
  onError
}) => {
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Получаем данные блока
  const block = useAppSelector(state => selectBlockWithEffectiveContent(state, blockId));
  const originalContent = useAppSelector(state => selectBlockOriginalContent(state, blockId));
  const overrides = useAppSelector(state => selectBlockOverrides(state, blockId));
  const isInstance = useAppSelector(state => selectIsBlockInstance(state, blockId));

  // Состояние для отслеживания изменений
  const [pendingOverrides, setPendingOverrides] = useState<Record<string, any>>(overrides || {});
  const [fields, setFields] = useState<OverrideField[]>([]);

  // Инициализация полей при загрузке компонента
  useEffect(() => {
    if (originalContent && block) {
      const fieldList: OverrideField[] = [];

      // Рекурсивно собираем все поля из контента
      const collectFields = (obj: any, prefix = '', labelPrefix = '') => {
        if (!obj || typeof obj !== 'object') return;

        for (const [key, value] of Object.entries(obj)) {
          const path = prefix ? `${prefix}.${key}` : key;
          const label = labelPrefix ? `${labelPrefix} > ${key}` : key;

          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // Рекурсивно обрабатываем вложенные объекты
            collectFields(value, path, label);
          } else {
            // Обычное поле
            const originalValue = getNestedProperty(originalContent, path);
            const currentValue = getNestedProperty(pendingOverrides, path) ?? originalValue;
            const fieldHasOverride = hasOverride(pendingOverrides, path);

            let fieldType: OverrideField['type'] = 'text';
            if (typeof originalValue === 'number') fieldType = 'number';
            else if (typeof originalValue === 'boolean') fieldType = 'boolean';
            else if (key.toLowerCase().includes('color')) fieldType = 'color';
            else if (typeof originalValue === 'string' && originalValue.length > 50) fieldType = 'textarea';

            fieldList.push({
              path,
              label,
              type: fieldType,
              originalValue,
              currentValue,
              hasOverride: fieldHasOverride
            });
          }
        }
      };

      collectFields(originalContent);
      setFields(fieldList);
    }
  }, [originalContent, block, pendingOverrides]);

  // Обработчик изменения поля
  const handleFieldChange = useCallback((path: string, value: any) => {
    setPendingOverrides(prev => ({ ...prev, [path]: value }));

    // Обновляем локальное состояние поля
    setFields(prev => prev.map(field =>
      field.path === path
        ? { ...field, currentValue: value, hasOverride: true }
        : field
    ));
  }, []);

  // Обработчик сброса переопределения
  const handleResetField = useCallback((path: string) => {
    const newOverrides = removeOverride(pendingOverrides, path);
    setPendingOverrides(newOverrides);

    // Обновляем локальное состояние поля
    setFields(prev => prev.map(field =>
      field.path === path
        ? {
            ...field,
            currentValue: field.originalValue,
            hasOverride: false
          }
        : field
    ));

    // Обновляем Redux store
    dispatch(removeBlockOverride({ blockId, path }));
  }, [pendingOverrides, blockId, dispatch]);

  // Сохранение переопределений на сервер
  const handleSave = useCallback(async () => {
    if (!block?.instance_id || !isInstance) return;

    setSaving(true);
    try {
      // Обновляем Redux store
      dispatch(setBlockOverride({ blockId, path: '', value: pendingOverrides }));

      // Сохраняем на сервер
      await updateBlockInstanceOverrides(block.instance_id, pendingOverrides);

      onSave?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не удалось сохранить переопределения';
      onError?.(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [block?.instance_id, isInstance, pendingOverrides, blockId, dispatch, onSave, onError]);

  // Загрузка переопределений с сервера
  const handleLoadFromServer = useCallback(async () => {
    if (!block?.instance_id || !isInstance) return;

    setLoading(true);
    try {
      const serverOverrides = await getBlockInstanceOverrides(block.instance_id);
      setPendingOverrides(serverOverrides);

      // Обновляем Redux store
      dispatch(setBlockOverride({ blockId, path: '', value: serverOverrides }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить переопределения';
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [block?.instance_id, isInstance, blockId, dispatch, onError]);

  // Очистка всех переопределений
  const handleClearAll = useCallback(async () => {
    if (!block?.instance_id || !isInstance) return;

    setSaving(true);
    try {
      await updateBlockInstanceOverrides(block.instance_id, {});
      setPendingOverrides({});

      // Обновляем Redux store
      dispatch(clearBlockOverrides(blockId));

      // Сбрасываем все поля
      setFields(prev => prev.map(field => ({
        ...field,
        currentValue: field.originalValue,
        hasOverride: false
      })));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не удалось очистить переопределения';
      onError?.(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [block?.instance_id, isInstance, blockId, dispatch, onError]);

  if (!isInstance) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        <p>Этот блок не является экземпляром переиспользуемого блока</p>
      </div>
    );
  }

  if (!block) {
    return (
      <div className="p-4 text-center">
        <Spinner className="w-6 h-6 mx-auto" />
        <p className="mt-2 text-gray-500 dark:text-gray-400">Загрузка блока...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <Typography as="h3" variant="h3" className="text-lg">
          Переопределения блока
        </Typography>
        <div className="flex gap-2">
          <Button
            onClick={handleLoadFromServer}
            disabled={loading}
            variant="secondary"
            size="sm"
          >
            {loading ? <Spinner className="w-4 h-4" /> : '🔄'} Загрузить
          </Button>
          <Button
            onClick={handleClearAll}
            disabled={saving}
            variant="danger"
            size="sm"
          >
            🗑️ Очистить все
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            variant="primary"
            size="sm"
          >
            {saving ? <Spinner className="w-4 h-4" /> : '💾'} Сохранить
          </Button>
        </div>
      </div>

      {/* Список полей */}
      <div className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Нет полей для редактирования</p>
          </div>
        ) : (
          fields.map((field) => (
            <OverrideFieldComponent
              key={field.path}
              field={field}
              onChange={handleFieldChange}
              onReset={handleResetField}
            />
          ))
        )}
      </div>

      {/* Статистика */}
      <Card className="p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Всего полей:</span>
          <span>{fields.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Переопределено:</span>
          <span className="text-blue-600 dark:text-blue-400">
            {fields.filter(f => f.hasOverride).length}
          </span>
        </div>
      </Card>
    </div>
  );
};

// Компонент для отдельного поля переопределения
interface OverrideFieldComponentProps {
  field: OverrideField;
  onChange: (path: string, value: any) => void;
  onReset: (path: string) => void;
}

const OverrideFieldComponent: React.FC<OverrideFieldComponentProps> = ({
  field,
  onChange,
  onReset
}) => {
  const handleInputChange = (value: any) => {
    let processedValue = value;

    // Обработка разных типов данных
    if (field.type === 'number') {
      processedValue = Number(value) || 0;
    } else if (field.type === 'boolean') {
      processedValue = Boolean(value);
    }

    onChange(field.path, processedValue);
  };

  const renderInput = () => {
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            value={field.currentValue || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={field.originalValue}
            rows={3}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={field.currentValue || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={String(field.originalValue)}
          />
        );

      case 'boolean':
        return (
          <select
            value={String(field.currentValue)}
            onChange={(e) => handleInputChange(e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="true">Да</option>
            <option value="false">Нет</option>
          </select>
        );

      case 'color':
        return (
          <div className="flex gap-2">
            <Input
              type="color"
              value={field.currentValue || field.originalValue || '#000000'}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-16 h-10 p-1 border border-gray-300 dark:border-gray-600 rounded"
            />
            <Input
              type="text"
              value={field.currentValue || ''}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={field.originalValue}
              className="flex-1"
            />
          </div>
        );

      default:
        return (
          <Input
            type="text"
            value={field.currentValue || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={field.originalValue}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Typography as="label" variant="label" className="text-sm font-medium">
            {field.label}
          </Typography>
          {field.hasOverride && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
              Переопределено
            </span>
          )}
        </div>
        {field.hasOverride && (
          <Button
            onClick={() => onReset(field.path)}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            ↺ Сбросить
          </Button>
        )}
      </div>

      {renderInput()}

      {!field.hasOverride && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Оригинальное значение: {String(field.originalValue)}
        </p>
      )}
    </div>
  );
};

export default OverridesPanel;
