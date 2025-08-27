export interface Property {
  id: string;
  name: string;
  price: number;
  residents: number;
  garageSpaces: number;
  imageUrl: string;
}

export interface Animation {
    id: string;
    name: string;
    source: string;
    code: number;
    category: string;
    imageUrl: string;
}

export interface ChangelogItem {
    id: string;
    version: string;
    timestamp: string;
    date: string;
    changes: string[];
}

export const ChangeType = {
    ADDED: 'ADDED',
    FIXED: 'FIXED',
    CHANGED: 'CHANGED',
} as const;
export type ChangeType = typeof ChangeType[keyof typeof ChangeType];
  
export interface ChangeLogHeatmapData {
    date: string;
    type: ChangeType;
    count: number;
}

export const ServerStatusState = {
    High: 'High',
    Medium: 'Medium',
    Low: 'Low',
    Offline: 'Offline',
} as const;
export type ServerStatusState = typeof ServerStatusState[keyof typeof ServerStatusState];

export interface ServerStatusInfo {
    id: string;
    name: string;
    online: number;
    status: ServerStatusState;
}
