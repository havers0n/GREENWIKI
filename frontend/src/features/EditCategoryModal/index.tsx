import React, { useState } from 'react';
import { Modal, Button, ButtonSize, Input } from '@my-forum/ui';
import { updateCategory } from 'shared/api/categories';
import type { Database, TablesUpdate } from '@my-forum/db-types';

interface Props {
  category: Database['public']['Tables']['categories']['Row'];
  onClose: () => void;
  onUpdated: () => void;
}

const EditCategoryModal: React.FC<Props> = ({ category, onClose, onUpdated }) => {
  const [name, setName] = useState(category.name || '');
  const [slug, setSlug] = useState(category.slug || '');
  const [position, setPosition] = useState<number | ''>(category.position ?? '');
  const [iconSvg, setIconSvg] = useState(category.icon_svg || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Функция валидации поля
  const validateField = (fieldName: string, value: string) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Название категории обязательно';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Название должно содержать минимум 2 символа';
        } else {
          delete newErrors.name;
        }
        break;
      case 'slug':
        if (!value.trim()) {
          newErrors.slug = 'Slug категории обязателен';
        } else if (!/^[a-z0-9-]+$/.test(value.trim())) {
          newErrors.slug = 'Slug может содержать только буквы, цифры и дефисы';
        } else {
          delete newErrors.slug;
        }
        break;
      case 'position':
        const numValue = Number(value);
        if (value && (isNaN(numValue) || numValue < 0)) {
          newErrors.position = 'Позиция должна быть положительным числом';
        } else {
          delete newErrors.position;
        }
        break;
    }

    setErrors(newErrors);
  };

  // Обработчик изменения поля
  const handleFieldChange = (fieldName: string, value: string) => {
    switch (fieldName) {
      case 'name':
        setName(value);
        break;
      case 'slug':
        setSlug(value);
        break;
      case 'position':
        setPosition(value === '' ? '' : Number(value));
        break;
      case 'iconSvg':
        setIconSvg(value);
        break;
    }
    validateField(fieldName, value);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидируем все поля перед отправкой
    validateField('name', name);
    validateField('slug', slug);
    validateField('position', position.toString());

    // Проверяем, есть ли ошибки
    if (Object.keys(errors).length > 0 || !name.trim() || !slug.trim()) {
      return;
    }

    setLoading(true);
    try {
      const updates: Partial<TablesUpdate<'categories'>> = {
        name: name.trim(),
        slug: slug.trim(),
        position: typeof position === 'number' ? position : 0,
        icon_svg: iconSvg.trim() || null,
      };
      await updateCategory(category.id, updates);
      onUpdated();
      onClose();
    } catch (e: any) {
      // Общая ошибка формы
      setErrors({ submit: e?.message || 'Не удалось обновить категорию' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Редактировать категорию" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-6">
        {errors.submit && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
            {errors.submit}
          </div>
        )}

        <Input
          label="Название категории"
          type="text"
          value={name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          error={errors.name}
          hint="Введите название категории (минимум 2 символа)"
          required
          placeholder="Моя категория"
        />

        <Input
          label="Slug категории"
          type="text"
          value={slug}
          onChange={(e) => handleFieldChange('slug', e.target.value)}
          error={errors.slug}
          hint="Уникальный идентификатор (только буквы, цифры и дефисы)"
          required
          placeholder="my-category"
        />

        <Input
          label="Позиция"
          type="number"
          value={position}
          onChange={(e) => handleFieldChange('position', e.target.value)}
          error={errors.position}
          hint="Порядок отображения в списке (необязательно)"
          placeholder="0"
          min="0"
        />

        <Input
          label="SVG иконка"
          type="text"
          value={iconSvg}
          onChange={(e) => handleFieldChange('iconSvg', e.target.value)}
          hint="SVG код иконки для категории (необязательно)"
          placeholder="<svg>...</svg>"
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={Object.keys(errors).length > 0 && !errors.submit}
          >
            {loading ? 'Сохранение…' : 'Сохранить изменения'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditCategoryModal;
