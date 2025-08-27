import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../../supabase';
import type { Profile } from '../../supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
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

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Храним id аварийного таймера, чтобы корректно очищать
  const emergencyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🚀 Initializing auth...');

      try {
        // Надёжная проверка конфигурации через env
        const urlConfigured = !!import.meta.env.VITE_SUPABASE_URL;
        const keyConfigured = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
        const isConfigured = urlConfigured && keyConfigured;

        if (!isConfigured) {
          console.log('🔧 Supabase not configured via env');
          setError('Supabase не настроен. Создайте файл .env с переменными окружения.');
          setLoading(false);
          return;
        }

        // Получаем начальную сессию
        console.log('📡 Getting session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('📥 Session result:', { session: session ? 'present' : 'null', error });

        if (error) {
          console.error('Error getting session:', error);
          setError('Ошибка подключения к сервису аутентификации');
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('👤 User found, fetching profile...');
          await fetchProfile(session.user.id);
        } else {
          console.log('👤 No user session, finishing loading...');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError('Ошибка инициализации аутентификации. Проверьте подключение к интернету.');
        setLoading(false);
      }
    };

    initializeAuth();

    // Слушаем изменения состояния аутентификации
    let subscription: { unsubscribe: () => void } | null = null;

    try {
      const { data } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      });

      subscription = data.subscription;
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      setError('Ошибка настройки слушателя аутентификации');
      setLoading(false);
    }

    // Устанавливаем аварийный таймер внутри эффекта
    if (emergencyTimeoutRef.current === null) {
      emergencyTimeoutRef.current = window.setTimeout(() => {
        if (loading) {
          console.warn('🚨 Emergency timeout: Forcing loading to complete');
          setError('Таймаут загрузки. Проверьте подключение к базе данных.');
          setLoading(false);
        }
      }, 15000);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
      if (emergencyTimeoutRef.current !== null) {
        clearTimeout(emergencyTimeoutRef.current);
        emergencyTimeoutRef.current = null;
      }
    };
  }, []);

  const stopLoadingSafely = () => {
    setLoading(false);
    if (emergencyTimeoutRef.current !== null) {
      clearTimeout(emergencyTimeoutRef.current);
      emergencyTimeoutRef.current = null;
    }
  };

  const fetchProfile = async (userId: string) => {
    console.log('🔍 Fetching profile for user:', userId);

    try {
      // Надёжная проверка конфигурации через env
      const urlConfigured = !!import.meta.env.VITE_SUPABASE_URL;
      const keyConfigured = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
      const isConfigured = urlConfigured && keyConfigured;

      if (!isConfigured) {
        console.log('🔧 Supabase not configured via env - skipping profile fetch');
        setError('Supabase не настроен. Создайте файл .env с переменными окружения.');
        stopLoadingSafely();
        return;
      }

      // Добавляем таймаут для запроса
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000);
      });

      console.log('📡 Making Supabase query...');
      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
      console.log('📥 Query result:', { data, error });

      if (error) {
        console.error('Error fetching profile:', error);

        if ((error as any).code === 'PGRST116') {
          console.log('🔧 Profile not found, creating new profile...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({ id: userId, role: 'user' })
            .select()
            .single();

          if (createError) {
            console.error('❌ Error creating profile:', createError);
            console.error('Create error details:', (createError as any).message, (createError as any).code);

            if ((createError as any).code === '42P01') {
              setError('Таблица profiles не существует в базе данных. Создайте таблицу через Supabase Studio.');
            } else if ((createError as any).code === '42501') {
              setError('Нет прав доступа к таблице profiles. Проверьте RLS политики.');
            } else {
              setError(`Ошибка создания профиля: ${(createError as any).message}`);
            }
          } else {
            console.log('✅ Profile created successfully:', newProfile);
            setProfile(newProfile);
            setError(null);
          }
        } else {
          console.error('❌ Error loading profile:', error);
          console.error('Error details:', (error as any).message, (error as any).code);

          if ((error as any).code === 'PGRST301') {
            setError('Ошибка подключения к базе данных. Проверьте настройки Supabase.');
          } else if ((error as any).code === '42501') {
            setError('Нет прав доступа к таблице profiles. Проверьте RLS политики.');
          } else if ((error as any).code === '42P01') {
            setError('Таблица profiles не существует в базе данных.');
          } else {
            setError(`Ошибка загрузки профиля: ${(error as any).message}`);
          }
        }
      } else {
        setProfile(data);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Ошибка загрузки профиля. Проверьте подключение к базе данных.');
    } finally {
      console.log('✅ Profile fetch completed');
      stopLoadingSafely();
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
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

      if (user?.id) {
        await fetchProfile(user.id);
      }

    } catch (error: any) {
      console.error('Error creating profiles table:', error);
      setError('Не удалось создать таблицу profiles. Следуйте инструкциям на странице /debug.');
    }
  };

  const forceCompleteLoading = () => {
    console.log('🔧 Force completing loading...');
    stopLoadingSafely();
    setError('Загрузка принудительно завершена');
  };

  // Добавляем глобальную отладочную информацию для браузера
  if (typeof window !== 'undefined') {
    (window as any).__AUTH_DEBUG__ = {
      user,
      profile,
      loading,
      error,
      session: session ? {
        access_token: session.access_token ? 'present' : 'missing',
        refresh_token: session.refresh_token ? 'present' : 'missing',
        expires_at: session.expires_at,
      } : null,
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
    session,
    user,
    profile,
    loading,
    error,
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