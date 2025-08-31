import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Input, Select, Textarea, RadioGroup, RadioGroupItem } from '@my-forum/ui';
import { fetchCategories } from 'shared/api/categories';
import { createSection } from 'shared/api/sections';
import type { Database, TablesInsert } from '@my-forum/db-types';
import { fetchAdminPages } from 'shared/api/pages';
import type { PageRow } from 'shared/api/pages';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

type Category = Database['public']['Tables']['categories']['Row'];

type LinkType = 'internal' | 'external';

const CreateSectionModal: React.FC<Props> = ({ onClose, onCreated }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pages, setPages] = useState<PageRow[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [position, setPosition] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [linkType, setLinkType] = useState<LinkType>('internal');
  const [pageId, setPageId] = useState<number | ''>('');
  const [externalUrl, setExternalUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadCats = async () => {
      try {
        setCategories(await fetchCategories());
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Ошибка загрузки категорий';
        setErrors({ general: errorMessage });
      }
    };
    loadCats();
  }, []);

  useEffect(() => {
    const loadPages = async () => {
      try {
        const data = await fetchAdminPages();
        setPages(data);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Ошибка загрузки страниц';
        setErrors({ general: errorMessage });
      }
    };
    loadPages();
  }, []);

  // Validation functions
  const validateField = (fieldName: string, value: string) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Название секции обязательно для заполнения';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Название должно содержать минимум 2 символа';
        } else if (value.trim().length > 100) {
          newErrors.name = 'Название не должно превышать 100 символов';
        } else {
          delete newErrors.name;
        }
        break;

      case 'description':
        if (value.trim().length > 500) {
          newErrors.description = 'Описание не должно превышать 500 символов';
        } else {
          delete newErrors.description;
        }
        break;

      case 'position': {
        const numValue = Number(value);
        if (value && (isNaN(numValue) || numValue < 0 || numValue > 999)) {
          newErrors.position = 'Позиция должна быть числом от 0 до 999';
        } else {
          delete newErrors.position;
        }
        break;
      }

      case 'categoryId':
        if (!value || value === '') {
          newErrors.categoryId = 'Необходимо выбрать категорию';
        } else {
          delete newErrors.categoryId;
        }
        break;

      case 'pageId':
        if (linkType === 'internal' && (!value || value === '')) {
          newErrors.pageId = 'Необходимо выбрать страницу для внутренней ссылки';
        } else {
          delete newErrors.pageId;
        }
        break;

      case 'externalUrl':
        if (linkType === 'external' && !value.trim()) {
          newErrors.externalUrl = 'Необходимо указать внешний URL';
        } else if (linkType === 'external' && value.trim()) {
          try {
            new URL(value.trim());
            delete newErrors.externalUrl;
          } catch {
            newErrors.externalUrl = 'Неверный формат URL (должен начинаться с http:// или https://)';
          }
        } else {
          delete newErrors.externalUrl;
        }
        break;
    }

    // XOR validation for link types
    if (linkType === 'internal' && pageId && Number(pageId) > 0 && externalUrl.trim()) {
      newErrors.linkXor = 'Нельзя указывать одновременно внутреннюю страницу и внешний URL';
    } else if (linkType === 'external' && externalUrl.trim() && pageId && Number(pageId) > 0) {
      newErrors.linkXor = 'Нельзя указывать одновременно внешний URL и внутреннюю страницу';
    } else {
      delete newErrors.linkXor;
    }

    setErrors(newErrors);
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    validateField(fieldName, value);
  };

  const handleLinkTypeChange = (value: string) => {
    const newLinkType = value as LinkType;
    setLinkType(newLinkType);

    // Clear opposite field when changing link type
    if (newLinkType === 'internal') {
      setExternalUrl('');
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.externalUrl;
        return newErrors;
      });
    } else {
      setPageId('');
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.pageId;
        return newErrors;
      });
    }

    // Re-validate link XOR
    validateField('pageId', pageId.toString());
    validateField('externalUrl', externalUrl);
  };

  const canSubmit = useMemo(() => {
    return Object.keys(errors).length === 0 &&
           name.trim().length >= 2 &&
           categoryId !== '' &&
           categoryId !== null &&
           ((linkType === 'internal' && Number(pageId) > 0 && pageId !== null) ||
            (linkType === 'external' && externalUrl.trim().length > 0));
  }, [errors, name, categoryId, linkType, pageId, externalUrl]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation of all fields
    validateField('name', name);
    validateField('description', description);
    validateField('position', position.toString());
    validateField('categoryId', categoryId.toString());
    validateField('pageId', pageId.toString());
    validateField('externalUrl', externalUrl);

    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const payload: TablesInsert<'sections'> = {
        name: name.trim(),
        description: description.trim() || null,
        position: typeof position === 'number' ? position : 0,
        icon_svg: null,
        category_id: categoryId as number,
        page_id: linkType === 'internal' ? (pageId as number) : null,
        external_url: linkType === 'external' ? externalUrl.trim() : null,
      };
      await createSection(payload);
      onCreated();
      onClose();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Не удалось создать секцию';
      setErrors(prev => ({
        ...prev,
        submit: errorMessage
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} title="Создать секцию" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-6">
        {errors.submit && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
            {errors.submit}
          </div>
        )}

        <Input
          label="Название секции"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            handleFieldChange('name', e.target.value);
          }}
          error={errors.name}
          hint="Введите название секции (минимум 2 символа, максимум 100)"
          required
          placeholder="Моя секция"
        />

        <Textarea
          label="Описание секции"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            handleFieldChange('description', e.target.value);
          }}
          error={errors.description}
          hint="Краткое описание секции для пользователей (максимум 500 символов)"
          rows={3}
          placeholder="Описание секции..."
        />

        <Input
          label="Позиция"
          type="number"
          value={position}
          onChange={(e) => {
            const value = e.target.value === '' ? '' : Number(e.target.value);
            setPosition(value);
            handleFieldChange('position', e.target.value);
          }}
          error={errors.position}
          hint="Число от 0 до 999 для определения порядка отображения"
          placeholder="0"
          min={0}
          max={999}
        />

        <Select
          label="Категория"
          value={categoryId === '' ? '' : String(categoryId)}
          onChange={(e) => {
            const value = e.target.value === '' ? '' : Number(e.target.value);
            setCategoryId(value);
            handleFieldChange('categoryId', e.target.value);
          }}
          error={errors.categoryId}
          hint="Выберите категорию, к которой относится секция"
          required
        >
          <option value="">Выберите категорию</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>{c.name}</option>
          ))}
        </Select>

        <RadioGroup
          label="Тип ссылки"
          value={linkType}
          onChange={handleLinkTypeChange}
          error={errors.linkXor}
          required
        >
          <RadioGroupItem
            value="internal"
            label="Внутренняя ссылка"
            hint="Ссылка на страницу внутри сайта"
          />
          <RadioGroupItem
            value="external"
            label="Внешняя ссылка"
            hint="Ссылка на внешний ресурс"
          />
        </RadioGroup>

        {linkType === 'internal' ? (
          <Select
            label="Страница"
            value={pageId === '' ? '' : String(pageId)}
            onChange={(e) => {
              const value = e.target.value === '' ? '' : Number(e.target.value);
              setPageId(value);
              handleFieldChange('pageId', e.target.value);
            }}
            error={errors.pageId}
            hint="Выберите страницу, на которую будет вести ссылка"
            required
          >
            <option value="">Выберите страницу</option>
            {pages.map((p) => (
              <option key={p.id} value={String(p.id)}>{p.title}</option>
            ))}
          </Select>
        ) : (
          <Input
            label="Внешний URL"
            type="url"
            value={externalUrl}
            onChange={(e) => {
              setExternalUrl(e.target.value);
              handleFieldChange('externalUrl', e.target.value);
            }}
            error={errors.externalUrl}
            hint="Полный URL внешнего ресурса (должен начинаться с http:// или https://)"
            placeholder="https://example.com"
            required
          />
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!canSubmit}
          >
            {loading ? 'Создание секции…' : 'Создать секцию'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateSectionModal;
