import React, { useEffect, useState } from 'react';
import type { Database, TablesInsert } from '@my-forum/db-types';
import { Card, Spinner, Typography, Button, Select } from 'shared/ui/atoms';
import PageEditorLayout from 'pages/PageEditorLayout';
import SettingsPanel from 'widgets/SettingsPanel';
import BlockRenderer from 'widgets/BlockRenderer';
import { fetchAdminLayoutByPage, createLayoutBlock, updateLayoutBlock } from 'shared/api/layout';
import { blockRegistry } from 'shared/config/blockRegistry';

// Тип записи блока лэйаута
// Синхронизирован с таблицей public.layout_blocks
// Нужен для строгой типизации массива blocks и выбранного блока

type LayoutBlock = Database['public']['Tables']['layout_blocks']['Row'];

interface LiveEditorProps {
  pageIdentifier: string;
}

const LiveEditor: React.FC<LiveEditorProps> = ({ pageIdentifier }) => {
  const [blocks, setBlocks] = useState<LayoutBlock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [newBlockType, setNewBlockType] = useState<string>('');
  const [adding, setAdding] = useState<boolean>(false);
  // Confirm-сценарий
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [changed, setChanged] = useState<Record<string, LayoutBlock>>({});
  const [saving, setSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAdminLayoutByPage(pageIdentifier);
        const ordered = data
          .slice()
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        if (!isMounted) return;
        setBlocks(ordered);
        // Если ранее выбранный блок отсутствует — снимаем выделение
        setSelectedBlockId((prev) => (ordered.some((b) => b.id === prev) ? prev : null));
        // Сброс локальных изменений при полной перезагрузке
        setIsDirty(false);
        setChanged({});
      } catch (e: unknown) {
        if (!isMounted) return;
        const message = e instanceof Error ? e.message : 'Не удалось загрузить блоки';
        setError(message);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };
    void load();
    return () => {
      isMounted = false;
    };
  }, [pageIdentifier]);

  const handleSelectBlock = (id: string | null) => {
    setSelectedBlockId(id);
  };

  const handleBlockChange = (updatedBlock: LayoutBlock) => {
    setBlocks((prev) => prev.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)));
    setChanged((prev) => ({ ...prev, [updatedBlock.id]: updatedBlock }));
    setIsDirty(true);
  };

  const handleAddBlock = async () => {
    if (!newBlockType) return;
    const spec = blockRegistry[newBlockType];
    if (!spec) return;
    try {
      setAdding(true);
      const nextPosition = (blocks.reduce((max, b) => Math.max(max, b.position ?? 0), 0) || 0) + 1;
      const payload: TablesInsert<'layout_blocks'> = {
        block_type: newBlockType,
        page_identifier: pageIdentifier,
        position: nextPosition,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        content: (spec.defaultData() as any),
      };
      const created = await createLayoutBlock(payload);
      setBlocks((prev) => {
        const merged = [...prev, created].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        return merged;
      });
      setSelectedBlockId(created.id);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Не удалось создать блок', e);
    } finally {
      setAdding(false);
    }
  };

  const handleSave = async () => {
    const changes = Object.values(changed);
    if (changes.length === 0) return;
    setSaving(true);
    setSaveError(null);
    try {
      const results = await Promise.allSettled(
        changes.map(async (blk) => updateLayoutBlock(blk.id, { content: blk.content }))
      );
      const failures = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
      if (failures.length > 0) {
        throw new Error(`Не удалось сохранить ${failures.length} блок(ов)`);
      }
      // Обновляем локальное состояние из результатов
      const updatedBlocks = results
        .filter((r): r is PromiseFulfilledResult<LayoutBlock> => r.status === 'fulfilled')
        .map((r) => r.value);
      if (updatedBlocks.length > 0) {
        setBlocks((prev) => {
          const byId = new Map(prev.map((b) => [b.id, b] as const));
          for (const ub of updatedBlocks) byId.set(ub.id, ub);
          return Array.from(byId.values()).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        });
      }
      setChanged({});
      setIsDirty(false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Ошибка сохранения изменений';
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminLayoutByPage(pageIdentifier);
      const ordered = data
        .slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      setBlocks(ordered);
      setSelectedBlockId((prev) => (ordered.some((b) => b.id === prev) ? prev : null));
      setChanged({});
      setIsDirty(false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Не удалось перезагрузить блоки';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const header = isDirty ? (
    <Card className="p-4 flex items-center justify-between">
      <div>
        <Typography as="h2" variant="h2">Есть несохраненные изменения</Typography>
        {saveError && (
          <div className="text-sm text-red-600 dark:text-red-400 mt-1">{saveError}</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" disabled={saving} onClick={handleCancel}>Отменить</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Сохранение…' : 'Сохранить изменения'}
        </Button>
      </div>
    </Card>
  ) : null;

  const sidebar = (
    <div className="space-y-3">
      <Card className="p-4 space-y-3">
        <Typography as="h2" variant="h2" className="mb-1">Добавить блок</Typography>
        <Select
          label="Тип блока"
          value={newBlockType}
          onChange={(e) => setNewBlockType(e.target.value)}
        >
          <option value="" disabled>Выберите тип...</option>
          {Object.values(blockRegistry).map((spec) => (
            <option key={spec.type} value={spec.type}>{spec.name}</option>
          ))}
        </Select>
        <Button onClick={handleAddBlock} disabled={!newBlockType || adding}>
          {adding ? 'Добавление...' : 'Добавить'}
        </Button>
      </Card>

      <SettingsPanel
        blocks={blocks}
        selectedBlockId={selectedBlockId}
        onSelectBlock={handleSelectBlock}
        onBlockChange={handleBlockChange}
      />
    </div>
  );

  const main = (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <Typography as="h2" variant="h2">Предпросмотр</Typography>
        {loading && <Spinner />}
      </div>
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">Ошибка: {error}</div>
      )}
      {!error && (
        <div className="space-y-12">
          <BlockRenderer
            pageIdentifier={pageIdentifier}
            blocks={blocks}
            editorMode
            selectedBlockId={selectedBlockId ?? undefined}
            onSelectBlock={handleSelectBlock}
          />
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-4">
      {header}
      <PageEditorLayout sidebarContent={sidebar} mainContent={main} />
    </div>
  );
};

export default LiveEditor;
