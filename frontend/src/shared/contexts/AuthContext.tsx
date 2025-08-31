import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../supabase';
import type { Profile } from '../../supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  loading: boolean; // Для совместимости
  error: string | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<Profile | undefined>;
  clearError: () => void;
  forceCompleteLoading: () => void;
  createProfileTable: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ЭФФЕКТ №1: ТОЛЬКО СИНХРОННОЕ УПРАВЛЕНИЕ СЕССИЕЙ
  useEffect(() => {
    const fetchInitialSession = async () => {
      // Получаем сессию один раз при загрузке приложения
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      // ВАЖНО: Мы ставим isLoading в false ЗДЕСЬ, только если сессии нет.
      // Если сессия есть, то Эффект №2 возьмет на себя управление isLoading.
      if (!session) {
        setIsLoading(false);
      }
    };

    fetchInitialSession();

    // Подписываемся на будущие изменения (логин, логаут)
    const { data: authListener } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      console.log('🔄 Auth state changed:', event, session ? 'session present' : 'no session');

      setUser(session?.user ?? null);

      // Если пользователь выходит, сразу же прекращаем загрузку
      if (event === 'SIGNED_OUT') {
        console.log('👤 User signed out, clearing state');
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // ЭФФЕКТ №2: РЕАКТИВНАЯ ЗАГРУЗКА ПРОФИЛЯ
  // Этот useEffect ЗАВИСИТ от `user`. Он запускается каждый раз, когда `user` меняется.
  // Это единственный useEffect, который вызывает fetchProfile.
  useEffect(() => {
    // Если есть пользователь, но нет профиля - надо загрузить.
    if (user) {
      setIsLoading(true); // Начинаем загрузку
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data, error }: { data: Profile | null; error: any }) => {
          if (error) {
            console.error('Error fetching profile:', error);
            setProfile(null);
          } else {
            setProfile(data);
          }
          // Завершаем загрузку ВНЕ зависимости от результата
          setIsLoading(false);
        });
    }
    // Если пользователя нет, то и профиль нам не нужен.
    // isLoading уже был установлен в false в Эффекте №1.
  }, [user]); // <-- КЛЮЧЕВОЙ МОМЕНТ!



  const refreshProfile = async () => {
    if (user) {
      setIsLoading(true);
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data, error }: { data: Profile | null; error: any }) => {
          if (error) {
            console.error('Error refreshing profile:', error);
            setProfile(null);
          } else {
            setProfile(data);
          }
          setIsLoading(false);
        });
    }
  };

  const signOut = async () => {
    console.log('🔄 Signing out...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Sign out error:', error);
        throw error;
      }
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Error signing out:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error as any;
      }

      setProfile(data);
      setError(null);
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Ошибка обновления профиля');
      throw error as any;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const createProfileTable = async () => {
    try {
      console.log('🔧 Creating profiles table...');

      const { error: rpcError } = await supabase.rpc('create_profiles_table');

      if (rpcError) {
        console.log('RPC function not available, trying direct SQL...');
        setError('Таблица profiles не существует. Следуйте инструкциям на странице /debug для создания таблицы.');
        return;
      }

      console.log('✅ Profiles table created successfully');
      setError(null);

      if (user) {
        // Перезапустим загрузку профиля через изменение user
        setUser({ ...user });
      }

    } catch (error: any) {
      console.error('Error creating profiles table:', error);
      setError('Не удалось создать таблицу profiles. Следуйте инструкциям на странице /debug.');
    }
  };

  const forceCompleteLoading = () => {
    console.log('🔧 Force completing loading...');
    setIsLoading(false);
    setError('Загрузка принудительно завершена');
  };

  // Добавляем глобальную отладочную информацию для браузера
  if (typeof window !== 'undefined') {
    (window as any).__AUTH_DEBUG__ = {
      user,
      profile,
      isLoading,
      loading: isLoading, // Для совместимости с существующими компонентами
      error,
      isAdmin: profile?.role === 'admin',
      timestamp: new Date().toISOString(),
    };

    (window as any).forceCompleteAuthLoading = forceCompleteLoading;
    (window as any).createProfileTable = createProfileTable;
    (window as any).checkSupabaseConfig = () => ({
      url: import.meta.env.VITE_SUPABASE_URL ? 'present' : 'MISSING',
      key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'present' : 'MISSING',
      configured: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
      timestamp: new Date().toISOString()
    });
  }

  const value = {
    user,
    profile,
    isLoading,
    loading: isLoading, // Для совместимости
    error,
    isAdmin: profile?.role === 'admin',
    signOut,
    refreshProfile,
    updateProfile,
    clearError,
    forceCompleteLoading,
    createProfileTable,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};