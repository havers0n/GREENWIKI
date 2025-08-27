import React, { useMemo, useState } from 'react';
import { Modal } from 'shared/ui/molecules/Modal';
import { Button, Input, Select, Textarea } from 'shared/ui/atoms';
import type { TablesInsert } from '@my-forum/db-types';
import { createPage } from 'shared/api/pages';

interface CreatePageModalProps {
  onClose: () => void;
  onCreated: () => void;
}

type PageStatus = 'draft' | 'published';

const CreatePageModal: React.FC<CreatePageModalProps> = ({ onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<PageStatus>('draft');
  const [content, setContent] = useState('');
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
      const payload: TablesInsert<'pages'> = {
        title: title.trim(),
        slug: slug.trim(),
        status,
        content: content.trim() || null,
      };
      await createPage(payload);
      onCreated();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Не удалось создать страницу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Создать страницу" onClose={onClose}>
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

export default CreatePageModal;
