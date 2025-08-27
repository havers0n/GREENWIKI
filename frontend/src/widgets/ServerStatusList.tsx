import React from 'react';
import { ServerStatus } from 'entities/server';
import type { ServerStatusInfo } from 'shared/lib/types';
import { Card } from 'shared/ui/atoms';

interface ServerStatusListProps {
    servers: ServerStatusInfo[];
}

export const ServerStatusList: React.FC<ServerStatusListProps> = ({ servers }) => {
    return (
        <Card>
            <div className="p-4 flex flex-wrap items-center justify-start gap-x-6 gap-y-2">
                {servers.map(server => <ServerStatus key={server.id} server={server} />)}
            </div>
        </Card>
    );
};
