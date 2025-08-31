import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Typography, Button, ButtonVariant, Card, FilterTabs, SearchInput, FilterButton } from '@my-forum/ui';

interface ControlsSectionProps {
  title?: string;
}

const ControlsSection: React.FC<ControlsSectionProps> = ({
  title = "UI Компоненты"
}) => {
    return (
        <section className="space-y-8">
            <Typography as="h2" variant="h2">{title}</Typography>

            {/* Typography */}
            <div>
                <Typography as="h3" variant="h3" className="mb-4">Typography</Typography>
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

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <div className="p-6 space-y-4">
                        <Typography as="h3" variant="h3">Buttons</Typography>
                        <div className="flex flex-wrap gap-4 items-center">
                            <Button>Primary</Button>
                            <Button variant={ButtonVariant.Secondary}>Secondary</Button>
                            <Button variant={ButtonVariant.Ghost}>Ghost</Button>
                            <Button>With Icon <span className="ml-2">→</span></Button>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="p-6 space-y-4">
                        <Typography as="h3" variant="h3">Inputs & Filters</Typography>
                        <SearchInput placeholder="Поиск недвижимости..." />
                        <FilterTabs options={['Все', 'Дома', 'Квартиры', 'Офисы', 'Склады']} active="Все" onSelect={() => {}} />
                        <div className="flex gap-2">
                            <FilterButton icon={Search}>$ Все</FilterButton>
                            <FilterButton icon={Filter}>По убыванию даты</FilterButton>
                        </div>
                    </div>
                </Card>
            </div>
        </section>
    );
};

export default ControlsSection;
