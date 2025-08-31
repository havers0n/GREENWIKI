import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { useDispatch, useSelector } from 'react-redux';

import { baseApi } from '../api/baseApi';

// Импорт reducers
import contentReducer from './slices/contentSlice';
import uiReducer from './slices/uiSlice';
import editorReducer from './slices/editorSlice';
import userReducer from './slices/userSlice';
import reusableBlocksReducer from './slices/reusableBlocksSlice';

// Настройка store с Redux Toolkit
export const store = configureStore({
  reducer: {
    // API слой
    [baseApi.reducerPath]: baseApi.reducer,

    // Доменные slices
    content: contentReducer,
    ui: uiReducer,
    editor: editorReducer,
    user: userReducer,
    reusableBlocks: reusableBlocksReducer,
  },

  // Добавляем middleware для API
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем несериализуемые значения для DnD
        ignoredActions: ['persist/PERSIST', 'dnd-kit/*'],
        ignoredPaths: ['editor.dndState'],
      },
    }).concat(baseApi.middleware),

  // Включаем Redux DevTools в development
  devTools: process.env.NODE_ENV === 'development',
});

// Настройка listeners для React Query
setupListeners(store.dispatch);

// Типы для TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Типизированные хуки для использования в компонентах
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector as any;