import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input } from 'shared/ui/atoms';
import { fetchAdminPages, deletePage } from 'shared/api/pages';
import type { PageRow } from 'shared/api/pages';
import CreatePageModal from 'features/CreatePageModal';
import EditPageModal from 'features/EditPageModal';

const PagesManager: React.FC = () => {
  const [items, setItems] = useState<PageRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<PageRow | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminPages();
      setItems(data);
    } catch (e: any) {
      setError(e?.message || 'Ошибка загрузки страниц');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) =>
      p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
    );
  }, [items, search]);

  const onDelete = async (id: number) => {
    if (!confirm('Удалить страницу?')) return;
    try {
      await deletePage(id);
      await load();
    } catch (e: any) {
      alert(e?.message || 'Не удалось удалить');
    }
  };

  const rows = useMemo(() => (
    filtered
      .sort((a, b) => (b.updated_at ? Date.parse(b.updated_at) : 0) - (a.updated_at ? Date.parse(a.updated_at) : 0))
      .map((p) => (
        <tr key={p.id} className="border-b border-gray-200 dark:border-gray-700">
          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{p.id}</td>
          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{p.title}</td>
          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{p.slug}</td>
          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{p.status}</td>
          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{p.updated_at ? new Date(p.updated_at).toLocaleString() : '—'}</td>
          <td className="px-4 py-2 text-right">
            <div className="flex gap-2 justify-end">
              <Button size="sm" onClick={() => setEditItem(p)}>Редактировать</Button>
              <Button size="sm" variant="danger" onClick={() => onDelete(p.id)}>Удалить</Button>
            </div>
          </td>
        </tr>
      ))
  ), [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Страницы</h1>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Поиск по названию или слагу"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={() => setCreateOpen(true)}>Создать страницу</Button>
        </div>
      </div>

      {loading && (
        <div className="py-10 text-center text-gray-600 dark:text-gray-300">Загрузка...</div>
      )}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" variant="ghost" onClick={load}>Повторить</Button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="p-8 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-center text-gray-600 dark:text-gray-300">
          Нет страниц. Создайте первую страницу.
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Slug</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Updated</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900">
              {rows}
            </tbody>
          </table>
        </div>
      )}

      {createOpen && (
        <CreatePageModal onClose={() => setCreateOpen(false)} onCreated={load} />
      )}
      {editItem && (
        <EditPageModal page={editItem} onClose={() => setEditItem(null)} onUpdated={load} />
      )}
    </div>
  );
};

export default PagesManager;
