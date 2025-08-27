import React from 'react';
import { Typography } from 'shared/ui/atoms';
import { PropertyCard } from 'entities/property';

const PropertiesSection = (): React.ReactNode => {
    const properties = [
        { id: '1', name: 'Дом #1554', price: 9500000, residents: 15, garageSpaces: 15, imageUrl: 'https://picsum.photos/seed/house1/400/300' },
        { id: '2', name: 'Дом #1553', price: 800000, residents: 10, garageSpaces: 10, imageUrl: 'https://picsum.photos/seed/house2/400/300' },
        { id: '3', name: 'Дом #1552', price: 6000000, residents: 10, garageSpaces: 10, imageUrl: 'https://picsum.photos/seed/house3/400/300' },
    ];

    return (
        <section className="space-y-6">
            <Typography as="h2" variant="h2">Недвижимость</Typography>
            <Typography as="h3" variant="h3">Таблица недвижимости</Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map(property => (
                    <PropertyCard key={property.id} property={property} />
                ))}
            </div>
        </section>
    );
};

export default PropertiesSection;
