import React from 'react';
import type { ServerStatusInfo } from '../../types';
import { ServerStatusState } from '../../types';
import { Typography } from '../../shared/ui/atoms/Typography';

interface ServerStatusProps {
    server: ServerStatusInfo;
}

const statusColors: Record<ServerStatusState, string> = {
    [ServerStatusState.High]: 'bg-status-red',
    [ServerStatusState.Medium]: 'bg-status-green',
    [ServerStatusState.Low]: 'bg-status-blue',
    [ServerStatusState.Offline]: 'bg-majestic-gray-300',
};

export const ServerStatus: React.FC<ServerStatusProps> = ({ server }) => {
    return (
        <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${statusColors[server.status]}`}></div>
            <Typography as="span" variant="body" className="font-semibold text-majestic-dark">{server.name}</Typography>
            <Typography as="span" variant="small">{server.online} online</Typography>
        </div>
    )
}
