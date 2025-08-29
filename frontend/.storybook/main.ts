import type { StorybookConfig } from '@storybook/react-vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: (cfg) => {
    cfg.resolve = cfg.resolve || {};
    cfg.resolve.alias = {
      ...(cfg.resolve.alias || {}),
      app: path.resolve(rootDir, '../src/app'),
      pages: path.resolve(rootDir, '../src/pages'),
      widgets: path.resolve(rootDir, '../src/widgets'),
      features: path.resolve(rootDir, '../src/features'),
      entities: path.resolve(rootDir, '../src/entities'),
      shared: path.resolve(rootDir, '../src/shared'),
    };
    return cfg;
  },
};

export default config;
