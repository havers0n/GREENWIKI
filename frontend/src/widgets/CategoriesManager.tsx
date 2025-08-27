import React, { useEffect, useMemo, useState } from 'react';
import { Button } from 'shared/ui/atoms/Button';
import CreateCategoryModal from 'features/CreateCategoryModal';
import EditCategoryModal from 'features/EditCategoryModal';
import { fetchCategories, deleteCategory } from 'shared/api/categories';
import type { Database } from '@my-forum/db-types';

// Тип категории
type Category = Database['public']['Tables']['categories']['Row'];

const CategoriesManager: React.FC = () => {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategories();
      setItems(data);
    } catch (e: any) {
      setError(e?.message || 'Ошибка загрузки категорий');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id: number) => {
    if (!confirm('Удалить категорию?')) return;
    try {
      await deleteCategory(id);
      await load();
    } catch (e: any) {
      alert(e?.message || 'Не удалось удалить');
    }
  };

  const rows = useMemo(() => (
    items
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((c) => (
        <tr key={c.id} className="border-b border-gray-200 dark:border-gray-700">
          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{c.id}</td>
          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{c.name}</td>
          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{c.slug}</td>
          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{c.position ?? 0}</td>
          <td className="px-4 py-2 text-right">
            <div className="flex gap-2 justify-end">
              <Button size="sm" onClick={() => setEditItem(c)}>Редактировать</Button>
              <Button size="sm" variant="danger" onClick={() => onDelete(c.id)}>Удалить</Button>
            </div>
          </td>
        </tr>
      ))
  ), [items]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Категории</h1>
        <Button onClick={() => setCreateOpen(true)}>Создать категорию</Button>
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

      {!loading && !error && items.length === 0 && (
        <div className="p-8 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-center text-gray-600 dark:text-gray-300">
          Нет категорий. Создайте первую категорию.
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Slug</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Position</th>
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
        <CreateCategoryModal onClose={() => setCreateOpen(false)} onCreated={load} />
      )}
      {editItem && (
        <EditCategoryModal category={editItem} onClose={() => setEditItem(null)} onUpdated={load} />
      )}
    </div>
  );
};

export default CategoriesManager;
