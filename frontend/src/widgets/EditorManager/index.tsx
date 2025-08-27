import React, { useEffect, useState } from 'react';
import type { Database } from '@my-forum/db-types';
import { Card, Spinner, Typography } from 'shared/ui/atoms';
import { fetchAdminLayoutByPage } from 'shared/api/layout';
import PageEditorLayout from 'pages/PageEditorLayout';
import SettingsPanel from 'widgets/SettingsPanel';
import BlockRenderer from 'widgets/BlockRenderer';

type LayoutBlock = Database['public']['Tables']['layout_blocks']['Row'];

interface EditorManagerProps {
  pageIdentifier: string;
}

const EditorManager: React.FC<EditorManagerProps> = ({ pageIdentifier }) => {
  const [blocks, setBlocks] = useState<LayoutBlock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAdminLayoutByPage(pageIdentifier);
        const ordered = data
          .slice()
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        setBlocks(ordered);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Не удалось загрузить блоки';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [pageIdentifier]);

  const sidebar = (
    <SettingsPanel blocks={blocks} />
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
          <BlockRenderer pageIdentifier={pageIdentifier} blocks={blocks} />
        </div>
      )}
    </Card>
  );

  return (
    <PageEditorLayout sidebarContent={sidebar} mainContent={main} />
  );
};

export default EditorManager;


