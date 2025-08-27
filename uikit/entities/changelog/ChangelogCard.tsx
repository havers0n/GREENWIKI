import React from 'react';
import type { ChangelogItem } from '../../types';
import { Card } from '../../shared/ui/atoms/Card';
import { Typography } from '../../shared/ui/atoms/Typography';
import { Button, ButtonVariant } from '../../shared/ui/atoms/Button';
import { Icon } from '../../shared/ui/atoms/Icon';

interface ChangelogCardProps {
  item: ChangelogItem;
}

export const ChangelogCard: React.FC<ChangelogCardProps> = ({ item }) => {
  return (
    <Card>
      <div className="p-6 flex items-start">
        <div className="text-right w-28 flex-shrink-0">
          <Typography as="p" variant="body" className="text-majestic-dark font-medium">{item.timestamp}</Typography>
          <Typography as="p" variant="small">{item.date}</Typography>
        </div>
        <div className="pl-6 ml-6 border-l border-majestic-gray-200 relative flex-grow">
          <div className="absolute -left-[9px] top-1 w-4 h-4 bg-majestic-pink rounded-full border-4 border-white"></div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <Typography as="h3" variant="h3"># Сборка {item.version}</Typography>
              <Typography as="p" variant="small" className="text-majestic-pink">Исправлена проблема в утреннем обновлении</Typography>
            </div>
            <Button variant={ButtonVariant.Ghost} className="text-majestic-gray-400 hover:text-majestic-dark !font-medium">
              Читать больше <Icon name="arrowRight" className="ml-2 w-4 h-4" />
            </Button>
          </div>
          <ul className="space-y-2 list-disc list-inside text-majestic-gray-400 text-sm">
            {item.changes.map((change, index) => (
              <li key={index}><span className="text-majestic-dark">{change}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};