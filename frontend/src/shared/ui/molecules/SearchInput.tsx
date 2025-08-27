
import React from 'react';
import { Icon } from '../atoms/Icon';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
}

export const SearchInput: React.FC<SearchInputProps> = ({ className = '', ...props }) => {
    return (
        <div className={`relative ${className}`}>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Icon name="search" className="text-majestic-gray-400" />
            </div>
            <input
                type="search"
                className="block w-full rounded-lg border-majestic-gray-200 bg-majestic-gray-100 py-2.5 pl-10 pr-4 text-sm text-majestic-dark placeholder:text-majestic-gray-400 focus:border-majestic-pink focus:ring-majestic-pink"
                {...props}
            />
        </div>
    );
};
