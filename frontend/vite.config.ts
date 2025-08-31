import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { visualizer } from 'rollup-plugin-visualizer'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - генерирует отчет о размере бандла
    visualizer({
      filename: 'docs/performance/bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      app: path.resolve(rootDir, 'src/app'),
      pages: path.resolve(rootDir, 'src/pages'),
      widgets: path.resolve(rootDir, 'src/widgets'),
      features: path.resolve(rootDir, 'src/features'),
      entities: path.resolve(rootDir, 'src/entities'),
      shared: path.resolve(rootDir, 'src/shared'),
      store: path.resolve(rootDir, 'src/store'),
      blocks: path.resolve(rootDir, 'src/blocks'),
      ui: path.resolve(rootDir, '../../packages/ui/src'),
    },
  },
})
