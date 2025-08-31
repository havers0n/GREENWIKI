import React from 'react';
import { Typography } from '@my-forum/ui';
import { ChangelogCard, ChangeLogHeatmap } from 'entities/changelog';
import type { ChangelogItem, ChangeLogHeatmapData } from 'shared/lib/types';

interface ChangelogSectionProps {
  title?: string;
  changelog?: ChangelogItem[];
  heatmap?: ChangeLogHeatmapData[];
}

const ChangelogSection: React.FC<ChangelogSectionProps> = ({
  title = "История изменений",
  changelog = [],
  heatmap = []
}) => {
    if ((!changelog || changelog.length === 0) && (!heatmap || heatmap.length === 0)) {
        return null;
    }

    return (
        <section className="space-y-6">
            <Typography as="h2" variant="h2">{title}</Typography>

            {heatmap && heatmap.length > 0 ? (
                <div className="mb-8">
                    <ChangeLogHeatmap data={heatmap} />
                </div>
            ) : null}

            {changelog && changelog.length > 0 ? (
                <div className="space-y-4">
                    {changelog.map(log => (
                        <ChangelogCard key={log.id} item={log} />
                    ))}
                </div>
            ) : null}
        </section>
    );
};

export default ChangelogSection;
