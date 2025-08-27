import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from 'shared/ui/molecules/Modal';
import { Button, Input, Select } from 'shared/ui/atoms';
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
    } catch (e: any) {
      setError(e?.message || 'Не удалось создать секцию');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Создать секцию" onClose={onClose}>
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

export default CreateSectionModal;
