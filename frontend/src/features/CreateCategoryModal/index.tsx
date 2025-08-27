import React, { useState } from 'react';
import { Modal } from 'shared/ui/molecules/Modal';
import { Button, Input } from 'shared/ui/atoms';
import { createCategory } from 'shared/api/categories';
import type { TablesInsert } from '@my-forum/db-types';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

const CreateCategoryModal: React.FC<Props> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [position, setPosition] = useState<number | ''>('');
  const [iconSvg, setIconSvg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !slug.trim()) {
      setError('Name и Slug обязательны');
      return;
    }
    setLoading(true);
    try {
      const payload: TablesInsert<'categories'> = {
        name: name.trim(),
        slug: slug.trim(),
        position: typeof position === 'number' ? position : 0,
        icon_svg: iconSvg.trim() || null,
      };
      await createCategory(payload);
      onCreated();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Не удалось создать категорию');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Создать категорию" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">{error}</div>
        )}
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <Input
          label="Position"
          type="number"
          value={position}
          onChange={(e) => setPosition(e.target.value === '' ? '' : Number(e.target.value))}
        />
        <Input label="icon_svg (опционально)" value={iconSvg} onChange={(e) => setIconSvg(e.target.value)} />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Отмена</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Сохранение…' : 'Сохранить'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateCategoryModal;
