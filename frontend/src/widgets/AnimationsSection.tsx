import React from 'react';
import { Typography } from 'shared/ui/atoms';
import { AnimationCard } from 'entities/animation';

const AnimationsSection = (): React.ReactNode => {
    const animations = [
        { id: '1', name: 'Accolades', source: 'Уникальный', code: 411, category: 'Весенний кейс 2025', imageUrl: 'https://picsum.photos/seed/anim1/300/400' },
        { id: '2', name: 'Miku Live', source: 'Уникальный', code: 410, category: 'Весенний кейс 2025', imageUrl: 'https://picsum.photos/seed/anim2/300/400' },
        { id: '3', name: 'Cupid Arrow', source: 'Уникальный', code: 409, category: 'Весенний кейс 2025', imageUrl: 'https://picsum.photos/seed/anim3/300/400' },
    ];

    return (
        <section className="space-y-6">
            <Typography as="h2" variant="h2">Анимации</Typography>
            <Typography as="h3" variant="h3">Таблица анимаций</Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {animations.map(animation => (
                    <AnimationCard key={animation.id} animation={animation} />
                ))}
            </div>
        </section>
    );
};

export default AnimationsSection;
