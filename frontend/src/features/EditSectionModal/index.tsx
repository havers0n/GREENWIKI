import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from 'shared/ui/molecules/Modal';
import { Button, Input, Select } from 'shared/ui/atoms';
import { fetchCategories } from 'shared/api/categories';
import { updateSection } from 'shared/api/sections';
import type { Database, TablesUpdate } from '@my-forum/db-types';
import { fetchAdminPages } from 'shared/api/pages';
import type { PageRow } from 'shared/api/pages';

interface Props {
  section: Database['public']['Tables']['sections']['Row'];
  onClose: () => void;
  onUpdated: () => void;
}

type Category = Database['public']['Tables']['categories']['Row'];

type LinkType = 'internal' | 'external';

const EditSectionModal: React.FC<Props> = ({ section, onClose, onUpdated }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [pages, setPages] = useState<PageRow[]>([]);
  const [name, setName] = useState(section.name || '');
  const [description, setDescription] = useState(section.description || '');
  const [position, setPosition] = useState<number | ''>(section.position ?? '');
  const [categoryId, setCategoryId] = useState<number | ''>(section.category_id ?? '');
  const [linkType, setLinkType] = useState<LinkType>(section.page_id ? 'internal' : section.external_url ? 'external' : 'internal');
  const [pageId, setPageId] = useState<number | ''>(section.page_id ?? '');
  const [externalUrl, setExternalUrl] = useState(section.external_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCats = async () => {
      try {
        setCategories(await fetchCategories());
      } catch (e: any) {
        setError(e?.message || 'Ошибка загрузки категорий');
      }
    };
    loadCats();
  }, []);

  useEffect(() => {
    const loadPages = async () => {
      try {
        const data = await fetchAdminPages();
        setPages(data);
      } catch (e: any) {
        setError(e?.message || 'Ошибка загрузки страниц');
      }
    };
    loadPages();
  }, []);

  useEffect(() => {
    if (linkType === 'internal') setExternalUrl('');
    else setPageId('');
  }, [linkType]);

  const xorValid = useMemo(() => {
    if (linkType === 'internal') return pageId !== '' && pageId !== null;
    return externalUrl.trim().length > 0;
  }, [linkType, pageId, externalUrl]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || categoryId === '' || categoryId === null) {
      setError('Name и Category обязательны');
      return;
    }
    if (!xorValid) {
      setError('Нужно указать ровно одно поле: page_id или external_url');
      return;
    }
    setLoading(true);
    try {
      const updates: Partial<TablesUpdate<'sections'>> = {
        name: name.trim(),
        description: description.trim() || null,
        position: typeof position === 'number' ? position : 0,
        category_id: categoryId as number,
        page_id: linkType === 'internal' ? (pageId as number) : null,
        external_url: linkType === 'external' ? externalUrl.trim() : null,
      };
      await updateSection(section.id, updates);
      onUpdated();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Не удалось обновить секцию');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Редактировать секцию" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">{error}</div>
        )}
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input
          label="Position"
          type="number"
          value={position}
          onChange={(e) => setPosition(e.target.value === '' ? '' : Number(e.target.value))}
        />
        <Select label="Категория" value={categoryId === '' ? '' : String(categoryId)} onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}>
          <option value="">Выберите категорию</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>{c.name}</option>
          ))}
        </Select>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
            <input type="radio" name="linkType" checked={linkType === 'internal'} onChange={() => setLinkType('internal')} />
            Внутренняя (page_id)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
            <input type="radio" name="linkType" checked={linkType === 'external'} onChange={() => setLinkType('external')} />
            Внешняя (external_url)
          </label>
        </div>

        {linkType === 'internal' ? (
          <Select label="Страница" value={pageId === '' ? '' : String(pageId)} onChange={(e) => setPageId(e.target.value === '' ? '' : Number(e.target.value))}>
            <option value="">Выберите страницу</option>
            {pages.map((p) => (
              <option key={p.id} value={String(p.id)}>{p.title}</option>
            ))}
          </Select>
        ) : (
          <Input label="external_url" placeholder="https://..." value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} />
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Отмена</Button>
          <Button type="submit" disabled={loading || !xorValid}>{loading ? 'Сохранение…' : 'Сохранить'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditSectionModal;
