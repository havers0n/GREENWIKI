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
}

interface ComponentMapProps {
  content?: any;
  [key: string]: any;
}

const componentMap: Record<string, React.ComponentType<ComponentMapProps>> = {
  'header': Header,
  'categories_section': CategoriesSection,
  'controls_section': ControlsSection,
  'properties_section': PropertiesSection,
  'animations_section': AnimationsSection,
  'changelog_section': ChangelogSection,
};

enum LoadingState {
  Loading = 'loading',
  Loaded = 'loaded',
  Error = 'error',
  Empty = 'empty',
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ pageIdentifier }) => {
  const [blocks, setBlocks] = useState<LayoutBlock[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.Loading);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    loadLayout();
  }, [pageIdentifier]);

  if (loadingState === LoadingState.Loading) {
    return <div>Loading...</div>;
  }

  if (loadingState === LoadingState.Error) {
    return <div>Error fetching data: {error}</div>;
  }

  if (loadingState === LoadingState.Empty) {
    return <div>No content available.</div>;
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
              {...(block.content as ComponentMapProps)}
            />
          );
        })}
    </div>
  );
};

export default BlockRenderer;
