
import React from 'react';
import { Header } from 'widgets/index';
import BlockRenderer from 'widgets/BlockRenderer';

const HomePage = (): React.ReactNode => {
    return (
        <>
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <BlockRenderer pageIdentifier="homepage" />
            </main>
        </>
    );
};

export default HomePage;
