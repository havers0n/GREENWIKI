import React from 'react';
import { Typography } from 'shared/ui/atoms';
import { ChangelogCard, ChangeLogHeatmap } from 'entities/changelog';
import { ChangeType } from 'shared/lib/types';

const ChangelogSection = (): React.ReactNode => {
    const changelog = [
        { id: '1', version: '3.10566.4765', timestamp: '18 ч 6 мин назад', date: '21.08.2025', changes: ['Утреннее обновление уже на сервере', 'Теперь при покупке дома или апартаментов через маркетплейс склад будет сохраняться.'] },
        { id: '2', version: '3.10556.4759', timestamp: '1 д 18 ч назад', date: '20.08.2025', changes: ['Увеличен лимит передаваемых предметов за одну операцию и прочее', 'Внесены различные исправления одежды из летнего пропуска.'] },
    ];

    const heatmapData = Array.from({ length: 150 }).map((_, i) => ({
        date: `2025-08-${(i % 30) + 1}`,
        type: [ChangeType.ADDED, ChangeType.FIXED, ChangeType.CHANGED][i % 3] as ChangeType,
        count: Math.floor(Math.random() * 3) + 1,
    }));

    return (
        <section className="space-y-6">
            <Typography as="h2" variant="h2">История изменений</Typography>

            <div className="mb-8">
                <ChangeLogHeatmap data={heatmapData} />
            </div>

            <div className="space-y-4">
                {changelog.map(log => (
                    <ChangelogCard key={log.id} item={log} />
                ))}
            </div>
        </section>
    );
};

export default ChangelogSection;
