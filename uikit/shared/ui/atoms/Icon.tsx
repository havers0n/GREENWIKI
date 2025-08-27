import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
    name: string;
}

const icons: { [key: string]: React.ReactNode } = {
    search: <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />,
    arrowRight: <path d="M5 12h14m-7-7 7 7-7 7" />,
    externalLink: <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3h6v6m-11 5L21 3" />,
    mapPin: <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />,
    users: <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />,
    garage: <path d="M22 10.5V20a1 1 0 0 1-1 1h-2.5a1 1 0 0 1-1-1v-4a1 1 0 0 0-1-1H7.5a1 1 0 0 0-1 1v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V10.5" /><path d="m22 9-9-6-10 6" />,
    map: <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" x2="9" y1="3" y2="18" /><line x1="15" x2="15" y1="6" y2="21" />,
    history: <path d="M1 4h2l3.4-3.4a1 1 0 0 1 1.4 0L10 4h2" /><path d="M1 20h2l3.4 3.4a1 1 0 0 0 1.4 0L10 20h2" /><rect width="18" height="12" x="3" y="6" rx="2" />,
    male: <path d="M9 5 12 2l3 3" /><path d="M12 18V2" /><circle cx="12" cy="21" r="2" />,
    female: <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5Z" /><path d="M12 12v9" /><path d="m9 18 6 0" />,
    filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,
    server: <><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></>
};

export const Icon: React.FC<IconProps> = ({ name, className = '', ...props }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`inline-block ${className}`}
            {...props}
        >
            {icons[name] || null}
        </svg>
    );
};