import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

// Базовый API клиент с Redux Toolkit Query
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      // Получаем токен из состояния
      const state = getState() as RootState;
      const token = state.user.tokens?.accessToken;

      // Добавляем токен авторизации
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      // Добавляем CSRF токен для защиты
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (csrfToken) {
        headers.set('x-csrf-token', csrfToken);
      }

      return headers;
    },

    // Обработка ответов
    responseHandler: async (response) => {
      if (response.status === 401) {
        // Автоматическая обработка истекшего токена
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
  }),

  // Тэги для инвалидации кеша
  tagTypes: [
    'Content',
    'Page',
    'Block',
    'User',
    'Media',
    'Template',
    'Settings'
  ],

  // Настройки кеширования
  keepUnusedDataFor: 300, // 5 минут
  refetchOnMountOrArgChange: true,
  refetchOnFocus: false,
  refetchOnReconnect: true,

  endpoints: () => ({}),
});

// Экспортируем хук для использования в компонентах
export const {
  usePrefetch,
} = baseApi;
