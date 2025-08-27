
import React from 'react';
import {
    Header,
    CategoriesSection,
    PropertiesSection,
    AnimationsSection,
    ChangelogSection,
    ControlsSection
} from 'widgets/index';

const HomePage = (): React.ReactNode => {
    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-12">
                    <CategoriesSection />
                    <ControlsSection />
                    <PropertiesSection />
                    <AnimationsSection />
                    <ChangelogSection />
                </div>
            </main>
        </>
    );
};

export default HomePage;
