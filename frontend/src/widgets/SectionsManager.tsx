import React, { useEffect, useMemo, useState } from 'react';
import { Button, ButtonSize, Input, Select } from '@my-forum/ui';
import { fetchCategories } from 'shared/api/categories';
import { fetchSectionsByCategoryId, fetchAllSections, deleteSection } from 'shared/api/sections';
import CreateSectionModal from 'features/CreateSectionModal';
import EditSectionModal from 'features/EditSectionModal';
import type { Database } from '@my-forum/db-types';

// Types

type Category = Database['public']['Tables']['categories']['Row'];
type Section = Database['public']['Tables']['sections']['Row'];

const ALL_CATEGORIES_VALUE = 'all';

const SectionsManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL_CATEGORIES_VALUE);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Section | null>(null);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (e: any) {
      setError(e?.message || 'Ошибка загрузки категорий');
    }
  };

  const loadSections = async (catValue: string) => {
    setLoading(true);
    setError(null);
    try {
      if (catValue === ALL_CATEGORIES_VALUE) {
        const all = await fetchAllSections();
        setSections(all);
      } else {
        const id = Number(catValue);
        const list = await fetchSectionsByCategoryId(id);
        setSections(list);
      }
    } catch (e: any) {
      setError(e?.message || 'Ошибка загрузки секций');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadSections(categoryFilter);
  }, [categoryFilter]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sections;
    return sections.filter((s) => s.name.toLowerCase().includes(query));
  }, [sections, search]);

  const onDelete = async (id: number) => {
    if (!confirm('Удалить секцию?')) return;
    try {
      await deleteSection(id);
      await loadSections(categoryFilter);
    } catch (e: any) {
      alert(e?.message || 'Не удалось удалить');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Секции</h1>
        <div className="flex items-center gap-3">
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            containerClassName="min-w-[220px]"
          >
            <option value={ALL_CATEGORIES_VALUE}>Все категории</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </Select>
          <Input
            placeholder="Поиск по названию"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            hint="Введите название секции для поиска"
          />
          <Button onClick={() => setCreateOpen(true)}>Создать секцию</Button>
        </div>
      </div>

      {loading && (
        <div className="py-10 text-center text-gray-600 dark:text-gray-300">Загрузка...</div>
      )}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <Button size={ButtonSize.Sm} variant="ghost" onClick={() => loadSections(categoryFilter)}>Повторить</Button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="p-8 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-center text-gray-600 dark:text-gray-300">
          Нет секций. Создайте первую секцию.
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Link Type</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900">
              {filtered
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                .map((s) => (
                  <tr key={s.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{s.id}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{s.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{s.category_id}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{s.position ?? 0}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                      {s.page_id ? 'internal' : s.external_url ? 'external' : '—'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size={ButtonSize.Sm} onClick={() => setEditItem(s)}>Редактировать</Button>
                        <Button size={ButtonSize.Sm} variant="danger" onClick={() => onDelete(s.id)}>Удалить</Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {createOpen && (
        <CreateSectionModal onClose={() => setCreateOpen(false)} onCreated={() => loadSections(categoryFilter)} />
      )}
      {editItem && (
        <EditSectionModal section={editItem} onClose={() => setEditItem(null)} onUpdated={() => loadSections(categoryFilter)} />
      )}
    </div>
  );
};

export default SectionsManager;
