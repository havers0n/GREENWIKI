// Типы для UnifiedSidebar

export type SidebarView = 'INSPECTOR' | 'BLOCK_LIBRARY' | 'REUSABLE_LIBRARY' | 'PAGE_SETTINGS';

export interface UnifiedSidebarProps {
  selectedBlockId: string | null;
  selectedBlock: any; // BlockNode type from NewLiveEditor
  onBlockChange: (updated: any) => void;
  onPublishToggle: (blockId: string) => void;
  publishing: boolean;
  onBlockDelete: (blockId: string) => void;
  allBlocks: any[]; // BlockNode[] type
  onMoveLeft: (blockId: string) => void;
  onMoveRight: (blockId: string) => void;
  onAddBlock: (type: string) => Promise<void>;
  adding: boolean;
  pageIdentifier: string;
  // Внешнее управление видом
  externalActiveView?: SidebarView;
  onViewChange?: (view: SidebarView) => void;
}
