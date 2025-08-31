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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React и основные зависимости - всегда загружаются
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // Redux store - для всех аутентифицированных страниц
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux', 'redux-persist'],

          // UI библиотека - лениво загружается для публичных страниц
          'ui-vendor': ['@my-forum/ui', 'framer-motion', 'lucide-react'],

          // Supabase - только для аутентифицированных пользователей
          'supabase-vendor': ['@supabase/supabase-js'],

          // DnD функциональность - только для редактора
          'dnd-vendor': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],

          // Виртуализация - только при необходимости
          'virtualization-vendor': ['@tanstack/react-virtual'],

          // Редактор компоненты - отдельный чанк для админ-панели
          'editor-core': [
            './src/widgets/BlockRenderer',
            './src/widgets/ContextualInspector',
            './src/widgets/EditorToolbar',
            './src/widgets/NewLiveEditor',
            './src/features/BlockEditors',
          ],

          // Библиотека блоков - отдельный чанк
          'blocks-library': [
            './src/widgets/BlockLibrary',
            './src/features/ReusableBlocksLibrary',
            './src/shared/config/blockRegistry',
          ],

          // Админ страницы - отдельный чанк
          'admin-pages': [
            './src/pages/AdminLayout',
            './src/pages/AdminEditorPage',
            './src/pages/AdminPagesPage',
            './src/pages/AdminCategoriesPage',
            './src/pages/AdminSectionsPage',
          ],
        },
      },
    },
    // Оптимизации для производительности
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
  },
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
  // Предзагрузка критических ресурсов
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
    ],
  },
})
