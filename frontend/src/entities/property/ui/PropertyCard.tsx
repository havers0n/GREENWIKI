import React from 'react';
import type { Property } from 'shared/lib/types';
import { Card, Typography, Icon } from 'shared/ui/atoms';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <Card className="overflow-hidden">
      <img src={property.imageUrl} alt={property.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <Typography as="h3" variant="h3">{property.name}</Typography>
        <Typography as="h3" variant="h3" className="text-majestic-dark my-2">
          {new Intl.NumberFormat('en-US').format(property.price)}$
        </Typography>
        <div className="flex justify-between text-majestic-gray-400 text-sm mt-4">
          <div className="flex items-center gap-2">
            <Icon name="users" className="w-4 h-4" />
            <span>{property.residents} жильцов</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="garage" className="w-4 h-4" />
            <span>{property.garageSpaces} гаражных мест</span>
          </div>
        </div>
      </div>
       <div className="p-4 border-t border-majestic-gray-200 flex justify-end">
          <button className="text-majestic-gray-400 hover:text-majestic-pink transition-colors">
            <Icon name="mapPin" />
          </button>
        </div>
    </Card>
  );
};
