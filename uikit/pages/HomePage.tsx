
import React from 'react';
import Header from '../widgets/Header';
import ComponentShowcase from '../widgets/ComponentShowcase';

const HomePage = (): React.ReactNode => {
    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ComponentShowcase />
            </main>
        </>
    );
};

export default HomePage;
