import React from 'react';
import { useAuth } from '../shared/contexts';
import { Card } from '@my-forum/ui';
import { Header } from '../widgets';

const DebugPage: React.FC = () => {
  const { user, profile, loading, error, session, forceCompleteLoading, createProfileTable } = useAuth();

  const debugInfo = {
    timestamp: new Date().toISOString(),
    loading,
    error,
    user: user ? {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
    } : null,
    profile: profile ? {
      id: profile.id,
      role: profile.role,
      username: profile.username,
    } : null,
    session: session ? {
      access_token: session.access_token ? 'present' : 'missing',
      refresh_token: session.refresh_token ? 'present' : 'missing',
      expires_at: session.expires_at,
      user: session.user ? 'present' : 'missing',
    } : null,
    env: {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'present' : 'missing',
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'present' : 'missing',
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Отладка аутентификации</h1>
          <p className="text-gray-600 mt-2">
            Эта страница помогает диагностировать проблемы с аутентификацией
          </p>
        </div>

        <div className="space-y-6">
          {/* Статус загрузки */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Статус загрузки</h2>
            <div className={`p-3 rounded-md text-sm ${
              loading
                ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                  Идет загрузка...
                </div>
              ) : (
                'Загрузка завершена'
              )}
            </div>
          </Card>

          {/* Ошибки */}
          {error && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-red-600">Ошибка</h2>
              <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200">
                <p className="mb-2">{error}</p>
                {error.includes('profiles не существует') && (
                  <div className="mt-4 p-3 bg-red-100 rounded text-sm">
                    <p className="font-medium mb-2">🔧 Решение: Создайте таблицу profiles</p>
                    <p className="mb-2">1. Откройте <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Supabase Studio</a></p>
                    <p className="mb-2">2. Выберите ваш проект</p>
                    <p className="mb-2">3. Перейдите в SQL Editor</p>
                    <p className="mb-3">4. Выполните этот SQL:</p>
                    <pre className="bg-red-200 p-2 rounded text-xs overflow-x-auto">
{`CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'user',
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Включить RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Создать политику для чтения
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Создать политику для создания
CREATE POLICY "Users can create own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Создать политику для обновления
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);`}
                    </pre>
                  </div>
                )}
                {error.includes('Нет прав доступа') && (
                  <div className="mt-4 p-3 bg-red-100 rounded text-sm">
                    <p className="font-medium mb-2">🔧 Решение: Проверьте RLS политики</p>
                    <p>В Supabase Studio → Authentication → Policies проверьте права доступа к таблице profiles.</p>
                  </div>
                )}
                {error.includes('Ошибка подключения') && (
                  <div className="mt-4 p-3 bg-red-100 rounded text-sm">
                    <p className="font-medium mb-2">🔧 Решение: Проверьте настройки Supabase</p>
                    <p>1. Проверьте URL и ключ в файле .env</p>
                    <p>2. Убедитесь, что проект Supabase активен</p>
                    <p>3. Проверьте квоты использования</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Переменные окружения */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Переменные окружения</h2>
            <div className="space-y-2">
              <div className={`p-2 rounded text-sm ${
                debugInfo.env.VITE_SUPABASE_URL === 'present'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                VITE_SUPABASE_URL: {debugInfo.env.VITE_SUPABASE_URL}
              </div>
              <div className={`p-2 rounded text-sm ${
                debugInfo.env.VITE_SUPABASE_ANON_KEY === 'present'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                VITE_SUPABASE_ANON_KEY: {debugInfo.env.VITE_SUPABASE_ANON_KEY}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <p className="text-sm text-blue-700">
                  <strong>Статус конфигурации:</strong> {
                    debugInfo.env.VITE_SUPABASE_URL === 'present' && debugInfo.env.VITE_SUPABASE_ANON_KEY === 'present'
                      ? '✅ Supabase настроен'
                      : '❌ Требуется настройка .env файла'
                  }
                </p>
              </div>
            </div>
          </Card>

          {/* Пользователь */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Пользователь</h2>
            {user ? (
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo.user, null, 2)}
              </pre>
            ) : (
              <div className="text-gray-500">Пользователь не авторизован</div>
            )}
          </Card>

          {/* Профиль */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Профиль</h2>
            {profile ? (
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo.profile, null, 2)}
              </pre>
            ) : (
              <div className="text-gray-500">Профиль не загружен</div>
            )}
          </Card>

          {/* Сессия */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Сессия</h2>
            {session ? (
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo.session, null, 2)}
              </pre>
            ) : (
              <div className="text-gray-500">Сессия отсутствует</div>
            )}
          </Card>

          {/* Действия */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Действия</h2>
            <div className="space-y-2">
              {loading && (
                <button
                  onClick={forceCompleteLoading}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  🚨 Принудительно завершить загрузку
                </button>
              )}

              {error && error.includes('profiles не существует') && (
                <button
                  onClick={createProfileTable}
                  className="w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                >
                  🔧 Создать таблицу profiles
                </button>
              )}

              <button
                onClick={() => window.location.href = '/login'}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Перейти к входу
              </button>
              <button
                onClick={() => window.location.href = '/admin'}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Перейти в админку
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Перезагрузить страницу
              </button>
            </div>
          </Card>

          {/* Полная отладочная информация */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Полная отладочная информация</h2>
            <details>
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                Нажмите для просмотра полной отладочной информации
              </summary>
              <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto mt-3">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          </Card>
        </div>
      </div>
    </>
  );
};

export default DebugPage;
