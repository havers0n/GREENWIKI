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

export enum ChangeType {
    ADDED,
    FIXED,
    CHANGED,
}
  
export interface ChangeLogHeatmapData {
    date: string;
    type: ChangeType;
    count: number;
}

export enum ServerStatusState {
    High,
    Medium,
    Low,
    Offline
}

export interface ServerStatusInfo {
    id: string;
    name: string;
    online: number;
    status: ServerStatusState;
}
