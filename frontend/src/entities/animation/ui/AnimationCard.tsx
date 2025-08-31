import React from 'react';
import type { Animation } from 'shared/lib/types';
import { Search, ExternalLink } from 'lucide-react';
import { Card, Typography, Icon } from '@my-forum/ui';

interface AnimationCardProps {
  animation: Animation;
}

export const AnimationCard: React.FC<AnimationCardProps> = ({ animation }) => {
  return (
    <Card className="flex flex-col items-center p-4 text-center">
        <div className="bg-majestic-gray-100 rounded-lg w-full aspect-[3/4] flex items-center justify-center mb-4 relative overflow-hidden">
            <svg className="absolute w-full h-full text-majestic-gray-200 opacity-50" fill="none" viewBox="0 0 100 133" >
                <circle cx="50" cy="66.5" r="40" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                <path d="M50 26.5 V66.5 L78.28 80.64" stroke="currentColor" strokeWidth="1" />
            </svg>
            <img src={animation.imageUrl} alt={animation.name} className="max-w-full max-h-full object-contain z-10" />
        </div>
        <Typography as="h3" variant="h3" className="mb-1">{animation.name}</Typography>
        <div className="flex items-center gap-2 text-majestic-gray-400 text-sm">
            <Icon icon={Search} className="w-4 h-4" />
            <span>{animation.name}</span>
            <Icon icon={ExternalLink} className="w-4 h-4" />
            <span>{animation.code}</span>
        </div>
        <div className="mt-2">
            <Typography as="p" variant="small">Источник</Typography>
            <Typography as="p" variant="body" className="text-majestic-dark font-medium">{animation.source}</Typography>
            <Typography as="p" variant="small">{animation.category}</Typography>
        </div>
    </Card>
  );
};
