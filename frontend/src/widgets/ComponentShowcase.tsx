import React from 'react';
import { Button, ButtonVariant } from 'shared/ui/atoms/Button';
import { Card } from 'shared/ui/atoms/Card';
import { Icon } from 'shared/ui/atoms/Icon';
import { Typography } from 'shared/ui/atoms/Typography';
import { FilterTabs } from 'shared/ui/molecules/FilterTabs';
import { SearchInput } from 'shared/ui/molecules/SearchInput';
import { PropertyCard } from 'entities/property';
import { AnimationCard } from 'entities/animation';
import { ChangelogCard, ChangeLogHeatmap } from 'entities/changelog';
import { CategoryCard } from 'entities/category';
import type { Property, Animation, ChangelogItem, ChangeLogHeatmapData, ServerStatusInfo } from 'shared/lib/types';
import { ChangeType, ServerStatusState } from 'shared/lib/types';
import { ServerStatusList } from 'widgets/ServerStatusList';
import { FilterButton } from 'shared/ui/molecules/FilterButton';

const mockProperties: Property[] = [
    { id: '1', name: 'Дом #1554', price: 9500000, residents: 15, garageSpaces: 15, imageUrl: 'https://picsum.photos/seed/house1/400/300' },
    { id: '2', name: 'Дом #1553', price: 800000, residents: 10, garageSpaces: 10, imageUrl: 'https://picsum.photos/seed/house2/400/300' },
    { id: '3', name: 'Дом #1552', price: 6000000, residents: 10, garageSpaces: 10, imageUrl: 'https://picsum.photos/seed/house3/400/300' },
];

const mockAnimations: Animation[] = [
    { id: '1', name: 'Accolades', source: 'Уникальный', code: 411, category: 'Весенний кейс 2025', imageUrl: 'https://picsum.photos/seed/anim1/300/400' },
    { id: '2', name: 'Miku Live', source: 'Уникальный', code: 410, category: 'Весенний кейс 2025', imageUrl: 'https://picsum.photos/seed/anim2/300/400' },
    { id: '3', name: 'Cupid Arrow', source: 'Уникальный', code: 409, category: 'Весенний кейс 2025', imageUrl: 'https://picsum.photos/seed/anim3/300/400' },
];

const mockChangelog: ChangelogItem[] = [
    { id: '1', version: '3.10566.4765', timestamp: '18 ч 6 мин назад', date: '21.08.2025', changes: ['Утреннее обновление уже на сервере', 'Теперь при покупке дома или апартаментов через маркетплейс склад будет сохраняться.'] },
    { id: '2', version: '3.10556.4759', timestamp: '1 д 18 ч назад', date: '20.08.2025', changes: ['Увеличен лимит передаваемых предметов за одну операцию и прочее', 'Внесены различные исправления одежды из летнего пропуска.'] },
];

const mockCategoryLinks = {
    'Подготовка': ['Установка игры', 'Дополнительное ПО', 'Серверы GTA 5 RP'],
    'Начало игры': ['Первые шаги', 'Начальные квесты', 'Взаимодействия'],
    'Основы игры': ['Работы', 'Бизнесы', 'Недвижимость'],
};

const heatmapData: ChangeLogHeatmapData[] = Array.from({ length: 150 }).map((_, i) => ({
    date: `2025-08-${(i % 30) + 1}`,
    type: [ChangeType.ADDED, ChangeType.FIXED, ChangeType.CHANGED][i % 3] as ChangeType,
    count: Math.floor(Math.random() * 3) + 1,
}));

const mockServers: ServerStatusInfo[] = [
    { id: '1', name: 'Dallas', online: 972, status: ServerStatusState.Medium },
    { id: '2', name: 'Boston', online: 908, status: ServerStatusState.Medium },
    { id: '3', name: 'Houston', online: 1712, status: ServerStatusState.High },
    { id: '4', name: 'Seattle', online: 2121, status: ServerStatusState.High },
    { id: '5', name: 'Phoenix', online: 3777, status: ServerStatusState.High },
    { id: '6', name: 'Detroit', online: 1062, status: ServerStatusState.High },
    { id: '7', name: 'Chicago', online: 121, status: ServerStatusState.Low },
];


const ComponentShowcase = (): React.ReactNode => {
    return (
        <div className="space-y-12">

            <div className="space-y-4">
                <Typography as="h1" variant="h1">Общие категории</Typography>
                <Typography as="p" variant="body">Здесь вы можете найти любую информацию о серверах Majestic и его системах</Typography>
            </div>

            <ServerStatusList servers={mockServers} />
            
            {/* Section: Typography */}
            <div>
                <Typography as="h2" variant="h2" className="mb-4 pb-2 border-b">Typography</Typography>
                <Card>
                    <div className="p-6 space-y-4">
                        <Typography as="h1" variant="h1">Display Heading (h1)</Typography>
                        <Typography as="h2" variant="h2">Section Heading (h2)</Typography>
                        <Typography as="h3" variant="h3">Card Title (h3)</Typography>
                        <Typography as="p" variant="body">This is body text. Used for descriptions and paragraphs. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Typography>
                        <Typography as="p" variant="small">This is small text. Often used for metadata, captions, or less important information.</Typography>
                        <Typography as="a" variant="link" href="#">This is a link</Typography>
                    </div>
                </Card>
            </div>

            {/* Section: Controls */}
            <div>
                <Typography as="h2" variant="h2" className="mb-4 pb-2 border-b">Controls</Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <div className="p-6 space-y-4">
                            <Typography as="h3" variant="h3">Buttons</Typography>
                            <div className="flex flex-wrap gap-4 items-center">
                                <Button>Primary</Button>
                                <Button variant={ButtonVariant.Secondary}>Secondary</Button>
                                <Button variant={ButtonVariant.Ghost}>Ghost</Button>
                                <Button>With Icon <Icon name="arrowRight" className="ml-2" /></Button>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="p-6 space-y-4">
                            <Typography as="h3" variant="h3">Inputs & Filters</Typography>
                            <SearchInput placeholder="Поиск недвижимости..." />
                             <FilterTabs options={['Все', 'Дома', 'Квартиры', 'Офисы', 'Склады']} active="Все" onSelect={() => {}} />
                            <div className="flex gap-2">
                                <FilterButton iconName="search">$ Все</FilterButton>
                                <FilterButton iconName="filter">По убыванию даты</FilterButton>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Section: Category Cards */}
            <div>
                <Typography as="h2" variant="h2" className="mb-4 pb-2 border-b">Category Cards</Typography>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <CategoryCard icon="server" title="Серверы" description="Список всех серверов Majestic RP" />
                    <CategoryCard icon="map" title="Карта" description="Карта сервера со всеми локациями" />
                    <CategoryCard icon="history" title="История изменений" description="История изменений на проекте" />
                    <CategoryCard icon="male" title="Мужская одежда" description="Поиск мод для мужчин" />
                    <CategoryCard icon="female" title="Женская одежда" description="Поиск мод для женщин" />
                    <CategoryCard icon="garage" title="Недвижимость" description="Данные по всем домам и квартирам" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {Object.entries(mockCategoryLinks).map(([title, links]) => (
                        <Card key={title}>
                           <div className="p-6">
                                <Typography as="h3" variant="h3" className="mb-3">{title}</Typography>
                                <ul className="space-y-2">
                                    {links.map(link => (
                                        <li key={link}>
                                            <Typography as="a" href="#" variant="link" className="text-majestic-dark hover:text-majestic-pink">{link}</Typography>
                                        </li>
                                    ))}
                                </ul>
                           </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Section: Entity Cards */}
            <div>
                <Typography as="h2" variant="h2" className="mb-4 pb-2 border-b">Entity Cards: Property</Typography>
                <Typography as="h3" variant="h3" className="my-6">Таблица недвижимости</Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockProperties.map(prop => <PropertyCard key={prop.id} property={prop} />)}
                </div>
            </div>

            <div>
                <Typography as="h2" variant="h2" className="mb-4 pb-2 border-b">Entity Cards: Animation</Typography>
                <Typography as="h3" variant="h3" className="my-6">Таблица анимаций</Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockAnimations.map(anim => <AnimationCard key={anim.id} animation={anim} />)}
                </div>
            </div>
            
            <div>
                <Typography as="h2" variant="h2" className="mb-4 pb-2 border-b">Entity Cards: Changelog</Typography>
                <Typography as="h3" variant="h3" className="my-6">История изменений</Typography>
                <div className="mb-8">
                    <ChangeLogHeatmap data={heatmapData} />
                </div>
                <div className="space-y-4">
                    {mockChangelog.map(log => <ChangelogCard key={log.id} item={log} />)}
                </div>
            </div>

        </div>
    );
};

export default ComponentShowcase;