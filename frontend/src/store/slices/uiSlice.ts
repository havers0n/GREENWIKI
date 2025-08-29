import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ModalState {
  [key: string]: boolean;
}

interface UIState {
  // Тема
  theme: 'light' | 'dark' | 'system';

  // Боковая панель
  sidebar: {
    open: boolean;
    width: number;
    collapsed: boolean;
  };

  // Модальные окна
  modals: ModalState;

  // Уведомления
  notifications: Notification[];

  // Загрузки
  loading: {
    global: boolean;
    components: Record<string, boolean>;
  };

  // Навигация
  navigation: {
    breadcrumbs: Array<{
      label: string;
      path?: string;
      icon?: string;
    }>;
    activePage: string;
  };

  // Настройки интерфейса
  preferences: {
    compactMode: boolean;
    showTips: boolean;
    language: string;
    timezone: string;
  };

  // Responsive
  viewport: {
    width: number;
    height: number;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
  };
}

const initialState: UIState = {
  theme: 'system',
  sidebar: {
    open: true,
    width: 280,
    collapsed: false,
  },
  modals: {},
  notifications: [],
  loading: {
    global: false,
    components: {},
  },
  navigation: {
    breadcrumbs: [],
    activePage: '',
  },
  preferences: {
    compactMode: false,
    showTips: true,
    language: 'ru',
    timezone: 'Europe/Moscow',
  },
  viewport: {
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Управление темой
    setTheme: (state, action: PayloadAction<UIState['theme']>) => {
      state.theme = action.payload;
      // Сохраняем в localStorage
      localStorage.setItem('ui-theme', action.payload);
    },

    // Управление боковой панелью
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebar.open = action.payload;
    },

    setSidebarWidth: (state, action: PayloadAction<number>) => {
      state.sidebar.width = action.payload;
    },

    toggleSidebar: (state) => {
      state.sidebar.open = !state.sidebar.open;
    },

    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebar.collapsed = action.payload;
    },

    // Управление модальными окнами
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true;
    },

    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false;
    },

    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },

    // Управление уведомлениями
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        ...action.payload,
      };
      state.notifications.push(notification);
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Управление загрузками
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },

    setComponentLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loading.components[action.payload.key] = action.payload.loading;
    },

    // Управление навигацией
    setBreadcrumbs: (state, action: PayloadAction<UIState['navigation']['breadcrumbs']>) => {
      state.navigation.breadcrumbs = action.payload;
    },

    addBreadcrumb: (state, action: PayloadAction<UIState['navigation']['breadcrumbs'][0]>) => {
      state.navigation.breadcrumbs.push(action.payload);
    },

    removeBreadcrumb: (state, action: PayloadAction<number>) => {
      state.navigation.breadcrumbs.splice(action.payload, 1);
    },

    clearBreadcrumbs: (state) => {
      state.navigation.breadcrumbs = [];
    },

    setActivePage: (state, action: PayloadAction<string>) => {
      state.navigation.activePage = action.payload;
    },

    // Управление настройками
    updatePreferences: (state, action: PayloadAction<Partial<UIState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
      // Сохраняем в localStorage
      Object.entries(action.payload).forEach(([key, value]) => {
        localStorage.setItem(`ui-preference-${key}`, JSON.stringify(value));
      });
    },

    // Управление viewport
    setViewport: (state, action: PayloadAction<{ width: number; height: number }>) => {
      const { width, height } = action.payload;
      state.viewport = {
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      };
    },

    // Восстановление состояния из localStorage
    hydrateUIState: (state) => {
      // Восстановление темы
      const savedTheme = localStorage.getItem('ui-theme') as UIState['theme'];
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        state.theme = savedTheme;
      }

      // Восстановление предпочтений
      Object.keys(state.preferences).forEach(key => {
        const savedValue = localStorage.getItem(`ui-preference-${key}`);
        if (savedValue) {
          try {
            (state.preferences as any)[key] = JSON.parse(savedValue);
          } catch (error) {
            console.warn(`Failed to parse saved preference for ${key}:`, error);
          }
        }
      });
    },
  },
});

export const {
  setTheme,
  setSidebarOpen,
  setSidebarWidth,
  toggleSidebar,
  setSidebarCollapsed,
  openModal,
  closeModal,
  closeAllModals,
  addNotification,
  removeNotification,
  clearNotifications,
  setGlobalLoading,
  setComponentLoading,
  setBreadcrumbs,
  addBreadcrumb,
  removeBreadcrumb,
  clearBreadcrumbs,
  setActivePage,
  updatePreferences,
  setViewport,
  hydrateUIState,
} = uiSlice.actions;

export default uiSlice.reducer;
