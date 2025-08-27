import React, { useMemo, useState } from 'react';
import { Modal } from 'shared/ui/molecules/Modal';
import { Button, Input, Select, Textarea } from 'shared/ui/atoms';
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
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && slug.trim().length > 0;
  }, [title, slug]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!canSubmit) {
      setError('Заполните обязательные поля: Title и Slug');
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
      setError(e?.message || 'Не удалось обновить страницу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Редактировать страницу" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">{error}</div>
        )}

        <Input
          label="Title"
          placeholder="Например, О проекте"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Input
          label="Slug"
          placeholder="naprimer-o-proekte"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          hint="URL-часть страницы. Должна быть уникальной."
        />

        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as PageStatus)}
        >
          <option value="draft">Черновик</option>
          <option value="published">Опубликована</option>
        </Select>

        <Textarea
          label="Content (Markdown)"
          rows={12}
          placeholder="# Заголовок\n\nПоддерживается Markdown."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Отмена</Button>
          <Button type="submit" disabled={loading || !canSubmit}>
            {loading ? 'Сохранение…' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditPageModal;
