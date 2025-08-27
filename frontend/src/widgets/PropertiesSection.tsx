import React from 'react';
import { Typography } from 'shared/ui/atoms';
import { PropertyCard } from 'entities/property';
import type { Property } from 'shared/lib/types';

interface PropertiesSectionProps {
  title?: string;
  subtitle?: string;
  properties?: Property[];
}

const PropertiesSection: React.FC<PropertiesSectionProps> = ({
  title = "Недвижимость",
  subtitle = "Таблица недвижимости",
  properties = []
}) => {
    if (!properties || properties.length === 0) {
        return null;
    }

    return (
        <section className="space-y-6">
            <Typography as="h2" variant="h2">{title}</Typography>
            {subtitle ? <Typography as="h3" variant="h3">{subtitle}</Typography> : null}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map(property => (
                    <PropertyCard key={property.id} property={property} />
                ))}
            </div>
        </section>
    );
};

export default PropertiesSection;
