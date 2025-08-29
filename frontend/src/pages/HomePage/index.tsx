
import * as React from 'react';
import BlockRenderer from 'widgets/BlockRenderer';

const HomePage = (): React.ReactNode => {
    // Временная заглушка - пустой массив блоков
    const blockTree: any[] = [];

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Главная страница</h1>
            <p className="text-gray-600 mb-8">Добро пожаловать в систему управления контентом!</p>
            <BlockRenderer
                blockTree={blockTree}
                editorMode={false}
            />
        </div>
    );
};

export default HomePage;
