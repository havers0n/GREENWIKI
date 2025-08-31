import React from 'react';
import { Card, Icon, Typography } from '@my-forum/ui';

interface CategoryCardProps {
  icon: string;
  title: string;
  description: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ icon, title, description }) => {
  return (
    <Card className="p-4 group transition-all hover:border-majestic-pink/50">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
                <Icon name={icon} className="w-8 h-8 text-majestic-dark group-hover:text-majestic-pink transition-colors" />
                 <div>
                    <Typography as="h3" variant="h3" className="mb-0.5">{title}</Typography>
                    <Typography as="p" variant="small">{description}</Typography>
                </div>
            </div>
            <button className="text-majestic-gray-300 group-hover:text-majestic-pink transition-colors">
                <Icon name="externalLink" className="w-5 h-5" />
            </button>
        </div>
    </Card>
  );
};
