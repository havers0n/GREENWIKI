import React from 'react';
import type { Database } from '@my-forum/db-types';
import { Card, Typography } from 'shared/ui/atoms';

type LayoutBlock = Database['public']['Tables']['layout_blocks']['Row'];

interface SettingsPanelProps {
  blocks: LayoutBlock[];
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ blocks }) => {
  return (
    <Card className="p-4">
      <Typography as="h2" variant="h2" className="mb-3">Блоки страницы</Typography>
      {blocks.length === 0 ? (
        <Typography className="text-gray-500 dark:text-gray-400">Список блоков пуст.</Typography>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {blocks
            .slice()
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            .map((b) => (
              <li key={b.id} className="py-2">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <Typography as="h3" variant="h3" className="truncate">
                      #{b.position} — {b.block_type}
                    </Typography>
                    {b.status && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">{b.status}</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
        </ul>
      )}
    </Card>
  );
};

export default SettingsPanel;


