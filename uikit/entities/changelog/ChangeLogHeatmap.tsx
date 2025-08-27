
import React from 'react';
import { ChangeLogHeatmapData, ChangeType } from '../../types';
import { Card } from '../../shared/ui/atoms/Card';

interface ChangeLogHeatmapProps {
  data: ChangeLogHeatmapData[];
}

const changeTypeColors: Record<ChangeType, string> = {
  [ChangeType.ADDED]: 'bg-status-green',
  [ChangeType.FIXED]: 'bg-status-red',
  [ChangeType.CHANGED]: 'bg-status-blue',
};

export const ChangeLogHeatmap: React.FC<ChangeLogHeatmapProps> = ({ data }) => {
  return (
    <Card className="p-4">
      <div className="flex flex-wrap gap-1">
        {data.map((item, index) => (
          <div
            key={index}
            className={`w-4 h-4 rounded-sm ${changeTypeColors[item.type]}`}
            title={`${item.date}: ${item.count} ${ChangeType[item.type].toLowerCase()}`}
          ></div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-4 text-sm text-majestic-gray-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-status-green"></div>
            <span>Добавлено</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-status-red"></div>
            <span>Исправлено</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-status-blue"></div>
            <span>Изменено</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <span>Меньше</span>
            <div className="flex gap-0.5">
                <div className="w-3 h-3 rounded-sm bg-majestic-gray-200"></div>
                <div className="w-3 h-3 rounded-sm bg-majestic-gray-300"></div>
                <div className="w-3 h-3 rounded-sm bg-majestic-gray-400"></div>
            </div>
            <span>Больше</span>
        </div>
      </div>
    </Card>
  );
};
