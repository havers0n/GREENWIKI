import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'super_admin' | 'admin' | 'editor' | 'author' | 'contributor' | 'reviewer' | 'viewer';

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

interface UserState {
  // Текущий пользователь
  currentUser: User | null;

  // Аутентификация
  isAuthenticated: boolean;
  tokens: AuthTokens | null;

  // Состояние загрузки
  loading: {
    login: boolean;
    register: boolean;
    profile: boolean;
    permissions: boolean;
  };

  // Ошибки
  errors: {
    login?: string;
    register?: string;
    profile?: string;
  };

  // Сессия
  session: {
    expiresAt?: Date;
    lastActivity?: Date;
  };

  // Настройки профиля
  profile: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      marketing: boolean;
    };
    dashboard: {
      widgets: string[];
      layout: 'grid' | 'list';
    };
  };
}

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  tokens: null,

  loading: {
    login: false,
    register: false,
    profile: false,
    permissions: false,
  },

  errors: {},

  session: {},

  profile: {
    theme: 'system',
    language: 'ru',
    timezone: 'Europe/Moscow',
    notifications: {
      email: true,
      push: true,
      marketing: false,
    },
    dashboard: {
      widgets: ['recent-content', 'stats', 'notifications'],
      layout: 'grid',
    },
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Аутентификация
    loginStart: (state) => {
      state.loading.login = true;
      state.errors.login = undefined;
    },

    loginSuccess: (state, action: PayloadAction<{ user: User; tokens: AuthTokens }>) => {
      state.currentUser = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
      state.loading.login = false;
      state.session.expiresAt = new Date(Date.now() + (action.payload.tokens.expiresIn * 1000));
      state.session.lastActivity = new Date();

      // Сохраняем токены в localStorage
      localStorage.setItem('auth_tokens', JSON.stringify(action.payload.tokens));
      localStorage.setItem('current_user', JSON.stringify(action.payload.user));
    },

    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading.login = false;
      state.errors.login = action.payload;
      state.isAuthenticated = false;
    },

    logout: (state) => {
      state.currentUser = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.session = {};

      // Очищаем localStorage
      localStorage.removeItem('auth_tokens');
      localStorage.removeItem('current_user');
    },

    // Регистрация
    registerStart: (state) => {
      state.loading.register = true;
      state.errors.register = undefined;
    },

    registerSuccess: (state, action: PayloadAction<{ user: User; tokens: AuthTokens }>) => {
      state.currentUser = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
      state.loading.register = false;
    },

    registerFailure: (state, action: PayloadAction<string>) => {
      state.loading.register = false;
      state.errors.register = action.payload;
    },

    // Обновление токенов
    refreshTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.tokens = action.payload;
      state.session.expiresAt = new Date(Date.now() + (action.payload.expiresIn * 1000));

      // Обновляем в localStorage
      localStorage.setItem('auth_tokens', JSON.stringify(action.payload));
    },

    // Обновление профиля
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
        localStorage.setItem('current_user', JSON.stringify(state.currentUser));
      }
    },

    // Обновление настроек профиля
    updateProfileSettings: (state, action: PayloadAction<Partial<UserState['profile']>>) => {
      state.profile = { ...state.profile, ...action.payload };
      localStorage.setItem('user_profile', JSON.stringify(state.profile));
    },

    // Проверка прав доступа
    checkPermissions: (state, action: PayloadAction<{ resource: string; action: string }>) => {
      // Логика проверки прав будет реализована в middleware
    },

    // Обновление активности сессии
    updateSessionActivity: (state) => {
      state.session.lastActivity = new Date();
    },

    // Очистка ошибок
    clearError: (state, action: PayloadAction<keyof UserState['errors']>) => {
      state.errors[action.payload] = undefined;
    },

    // Восстановление состояния из localStorage
    hydrateUserState: (state) => {
      try {
        // Восстановление токенов
        const savedTokens = localStorage.getItem('auth_tokens');
        if (savedTokens) {
          const tokens: AuthTokens = JSON.parse(savedTokens);
          state.tokens = tokens;
          state.session.expiresAt = new Date(Date.now() + (tokens.expiresIn * 1000));
        }

        // Восстановление пользователя
        const savedUser = localStorage.getItem('current_user');
        if (savedUser) {
          const user: User = JSON.parse(savedUser);
          state.currentUser = user;
          state.isAuthenticated = true;
        }

        // Восстановление настроек профиля
        const savedProfile = localStorage.getItem('user_profile');
        if (savedProfile) {
          const profile: UserState['profile'] = JSON.parse(savedProfile);
          state.profile = { ...state.profile, ...profile };
        }
      } catch (error) {
        console.warn('Failed to hydrate user state:', error);
        // В случае ошибки очищаем состояние
        state.currentUser = null;
        state.tokens = null;
        state.isAuthenticated = false;
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  registerStart,
  registerSuccess,
  registerFailure,
  refreshTokens,
  updateProfile,
  updateProfileSettings,
  checkPermissions,
  updateSessionActivity,
  clearError,
  hydrateUserState,
} = userSlice.actions;

export default userSlice.reducer;
