import React from 'react';
import { Typography } from 'shared/ui/atoms';
import { CategoryCard } from 'entities/category';
import { Card } from 'shared/ui/atoms';

const CategoriesSection = (): React.ReactNode => {
    const categories = [
        { icon: 'server', title: 'Серверы', description: 'Список всех серверов Majestic RP' },
        { icon: 'map', title: 'Карта', description: 'Карта сервера со всеми локациями' },
        { icon: 'history', title: 'История изменений', description: 'История изменений на проекте' },
        { icon: 'male', title: 'Мужская одежда', description: 'Поиск мод для мужчин' },
        { icon: 'female', title: 'Женская одежда', description: 'Поиск мод для женщин' },
        { icon: 'garage', title: 'Недвижимость', description: 'Данные по всем домам и квартирам' },
    ];

    const categoryLinks = {
        'Подготовка': ['Установка игры', 'Дополнительное ПО', 'Серверы GTA 5 RP'],
        'Начало игры': ['Первые шаги', 'Начальные квесты', 'Взаимодействия'],
        'Основы игры': ['Работы', 'Бизнесы', 'Недвижимость'],
    };

    return (
        <section className="space-y-8">
            <div className="space-y-4">
                <Typography as="h1" variant="h1">Общие категории</Typography>
                <Typography as="p" variant="body">Здесь вы можете найти любую информацию о серверах Majestic и его системах</Typography>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((category, index) => (
                    <CategoryCard
                        key={index}
                        icon={category.icon}
                        title={category.title}
                        description={category.description}
                    />
                ))}
            </div>

            {/* Category Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(categoryLinks).map(([title, links]) => (
                    <Card key={title}>
                        <div className="p-6">
                            <Typography as="h3" variant="h3" className="mb-3">{title}</Typography>
                            <ul className="space-y-2">
                                {links.map(link => (
                                    <li key={link}>
                                        <Typography as="a" href="#" variant="link" className="text-majestic-dark hover:text-majestic-pink">
                                            {link}
                                        </Typography>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
};

export default CategoriesSection;
