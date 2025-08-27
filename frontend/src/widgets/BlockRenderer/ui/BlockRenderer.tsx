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

const BlockRenderer: React.FC<BlockRendererProps> = ({ pageIdentifier, blocks: externalBlocks }) => {
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

          return (
            <Component
              key={block.id}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              {...(block.content as Record<string, unknown>)}
            />
          );
        })}
    </div>
  );
};

export default BlockRenderer;
