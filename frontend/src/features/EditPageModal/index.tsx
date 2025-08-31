import React, { useState } from 'react';
import { Modal, Button, Input, Select, Textarea } from '@my-forum/ui';
import { updatePage } from 'shared/api/pages';
import type { PageRow } from 'shared/api/pages';
import type { TablesUpdate } from '@my-forum/db-types';

interface EditPageModalProps {
  page: PageRow;
  onClose: () => void;
  onUpdated: () => void;
}

type PageStatus = 'draft' | 'published';

const EditPageModal: React.FC<EditPageModalProps> = ({ page, onClose, onUpdated }) => {
  const [title, setTitle] = useState(page.title || '');
  const [slug, setSlug] = useState(page.slug || '');
  const [status, setStatus] = useState<PageStatus>((page.status as PageStatus) || 'draft');
  const [content, setContent] = useState(page.content || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Функция валидации поля
  const validateField = (fieldName: string, value: string) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'title':
        if (!value.trim()) {
          newErrors.title = 'Название страницы обязательно';
        } else if (value.trim().length < 2) {
          newErrors.title = 'Название должно содержать минимум 2 символа';
        } else if (value.trim().length > 100) {
          newErrors.title = 'Название не должно превышать 100 символов';
        } else {
          delete newErrors.title;
        }
        break;
      case 'slug':
        if (!value.trim()) {
          newErrors.slug = 'Slug страницы обязателен';
        } else if (!/^[a-z0-9-]+$/.test(value.trim())) {
          newErrors.slug = 'Slug может содержать только буквы, цифры и дефисы';
        } else if (value.trim().length > 100) {
          newErrors.slug = 'Slug не должен превышать 100 символов';
        } else {
          delete newErrors.slug;
        }
        break;
    }

    setErrors(newErrors);
  };

  // Обработчик изменения поля
  const handleFieldChange = (fieldName: string, value: string) => {
    switch (fieldName) {
      case 'title':
        setTitle(value);
        break;
      case 'slug':
        setSlug(value);
        break;
      case 'content':
        setContent(value);
        break;
    }
    validateField(fieldName, value);
  };



  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидируем все поля перед отправкой
    validateField('title', title);
    validateField('slug', slug);

    // Проверяем, есть ли ошибки
    if (Object.keys(errors).length > 0 || !title.trim() || !slug.trim()) {
      return;
    }

    setLoading(true);
    try {
      const updates: Partial<TablesUpdate<'pages'>> = {
        title: title.trim(),
        slug: slug.trim(),
        status,
        content: content.trim() || null,
      };
      await updatePage(page.id, updates);
      onUpdated();
      onClose();
    } catch (e: any) {
      // Общая ошибка формы
      setErrors({ submit: e?.message || 'Не удалось обновить страницу' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} title="Редактировать страницу" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-6">
        {errors.submit && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
            {errors.submit}
          </div>
        )}

        <Input
          label="Название страницы"
          type="text"
          value={title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          error={errors.title}
          hint="Введите название страницы (минимум 2 символа, максимум 100)"
          required
          placeholder="Моя страница"
        />

        <Input
          label="Slug страницы"
          type="text"
          value={slug}
          onChange={(e) => handleFieldChange('slug', e.target.value)}
          error={errors.slug}
          hint="Уникальный идентификатор (только буквы, цифры и дефисы)"
          required
          placeholder="my-page"
        />

        <Select
          label="Статус страницы"
          value={status}
          onChange={(e) => setStatus(e.target.value as PageStatus)}
          hint="Черновик - видна только администраторам, Опубликована - видна всем"
        >
          <option value="draft">Черновик</option>
          <option value="published">Опубликована</option>
        </Select>

        <Textarea
          label="Содержимое страницы (Markdown)"
          rows={12}
          value={content}
          onChange={(e) => handleFieldChange('content', e.target.value)}
          hint="Поддерживается Markdown разметка. Оставьте пустым для удаления содержимого."
          placeholder="# Заголовок страницы

## Подзаголовок

Обычный текст с **жирным** и *курсивным* форматированием.

- Список элементов
- Еще один элемент

[Ссылка](https://example.com)"
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

export default EditPageModal;
