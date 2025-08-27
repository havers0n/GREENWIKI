
import React from 'react';
import { SearchInput } from 'shared/ui/molecules';

const Header = (): React.ReactNode => {
    return (
        <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM0 12C0 5.37 5.37 0 12 0C18.63 0 24 5.37 24 12C24 18.63 18.63 24 12 24C5.37 24 0 18.63 0 12Z" fill="#E6007A"/>
                            <path d="M12 6C11.45 6 11 6.45 11 7V12C11 12.55 11.45 13 12 13C12.55 13 13 12.55 13 12V7C13 6.45 12.55 6 12 6Z" fill="#E6007A"/>
                            <path d="M12 15C11.45 15 11 15.45 11 16C11 16.55 11.45 17 12 17C12.55 17 13 16.55 13 16C13 15.45 12.55 15 12 15Z" fill="#E6007A"/>
                        </svg>
                    </div>
                    <div className="flex-1 max-w-lg mx-4">
                        <SearchInput placeholder="Поиск информации на сайте..." />
                    </div>
                    <div className="flex items-center">
                        <div className="w-10 h-10 bg-majestic-gray-200 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-majestic-gray-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export { Header };
