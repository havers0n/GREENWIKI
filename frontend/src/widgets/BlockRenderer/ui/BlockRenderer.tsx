import React, { useState, useEffect } from 'react';
import { fetchLayoutByPage } from 'shared/api/layout';
import type { Database } from '@my-forum/db-types';
import { Header } from 'widgets/Header';
import CategoriesSection from 'widgets/CategoriesSection';
import ControlsSection from 'widgets/ControlsSection';
import PropertiesSection from 'widgets/PropertiesSection';
import AnimationsSection from 'widgets/AnimationsSection';
import ChangelogSection from 'widgets/ChangelogSection';

type LayoutBlock = Database['public']['Tables']['layout_blocks']['Row'];

interface BlockRendererProps {
  pageIdentifier: string;
  blocks?: LayoutBlock[];
  /** Включает режим редактора: клики по блокам выбирают их, выбранный подсвечивается */
  editorMode?: boolean;
  /** ID выбранного блока для подсветки */
  selectedBlockId?: string | null;
  /** Колбэк выбора блока по клику в превью (null — снять выделение) */
  onSelectBlock?: (id: string | null) => void;
}

// Use a permissive props type to allow different sections to define their own props contracts
// while keeping mapping strongly keyed by string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = React.ComponentType<any>;

const componentMap: Record<string, AnyComponent> = {
  header: Header as AnyComponent,
  categories_section: CategoriesSection as AnyComponent,
  controls_section: ControlsSection as AnyComponent,
  properties_section: PropertiesSection as AnyComponent,
  animations_section: AnimationsSection as AnyComponent,
  changelog_section: ChangelogSection as AnyComponent,
};

const LoadingState = {
  Loading: 'loading',
  Loaded: 'loaded',
  Error: 'error',
  Empty: 'empty',
} as const;

type LoadingState = typeof LoadingState[keyof typeof LoadingState];

const BlockRenderer: React.FC<BlockRendererProps> = ({ pageIdentifier, blocks: externalBlocks, editorMode = false, selectedBlockId, onSelectBlock }) => {
  const [blocks, setBlocks] = useState<LayoutBlock[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.Loading);
  const [error, setError] = useState<string | null>(null);

  // If blocks are provided from outside (e.g., EditorManager), use them and skip fetching
  useEffect(() => {
    if (typeof externalBlocks !== 'undefined') {
      setBlocks(externalBlocks);
      setLoadingState(externalBlocks.length > 0 ? LoadingState.Loaded : LoadingState.Empty);
    }
  }, [externalBlocks]);

  // Fallback: fetch blocks only when no external blocks are provided
  useEffect(() => {
    if (typeof externalBlocks !== 'undefined') return;
    const loadLayout = async () => {
      try {
        setLoadingState(LoadingState.Loading);
        const layoutBlocks = await fetchLayoutByPage(pageIdentifier);

        if (layoutBlocks.length === 0) {
          setLoadingState(LoadingState.Empty);
        } else {
          setBlocks(layoutBlocks);
          setLoadingState(LoadingState.Loaded);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoadingState(LoadingState.Error);
      }
    };

    void loadLayout();
  }, [pageIdentifier, externalBlocks]);

  if (loadingState === LoadingState.Loading) {
    return <div>Loading...</div>;
  }

  if (loadingState === LoadingState.Error) {
    return <div>Error fetching data: {error}</div>;
  }

  if (loadingState === LoadingState.Empty) {
    return null;
  }

  return (
    <div className="space-y-12">
      {blocks
        .sort((a, b) => (a.position || 0) - (b.position || 0))
        .map((block) => {
          const Component = componentMap[block.block_type];

          if (!Component) {
            console.warn(`Unknown block type: ${block.block_type}`);
            return null;
          }

          const isSelected = selectedBlockId === block.id;
          const wrapperClassName = editorMode
            ? `relative rounded-md ${isSelected ? 'ring-2 ring-blue-500' : 'ring-1 ring-transparent hover:ring-blue-300'} cursor-pointer`
            : undefined;

          const handleClick = editorMode && onSelectBlock
            ? (e: React.MouseEvent<HTMLDivElement>) => {
                e.stopPropagation();
                onSelectBlock(block.id);
              }
            : undefined;

          return (
            <div key={block.id} className={wrapperClassName} onClick={handleClick} data-block-id={block.id}>
              <Component
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                {...(block.content as Record<string, unknown>)}
              />
            </div>
          );
        })}
    </div>
  );
};

export default BlockRenderer;
