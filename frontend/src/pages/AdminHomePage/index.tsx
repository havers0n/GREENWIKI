import React, { useState } from 'react';
import { useAuth } from '../../shared/contexts';
import { supabase } from '../../supabase';
import { Card } from '../../shared/ui/atoms';
import { Button } from '../../shared/ui/atoms';

const AdminHomePage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  const grantAdminRole = async () => {
    if (!user?.id) return;

    setIsUpdating(true);
    setUpdateMessage(null);

    try {
      await updateProfile({ role: 'admin' });
      setUpdateMessage('✅ Роль администратора успешно назначена!');
    } catch (error: any) {
      console.error('Error updating role:', error);
      setUpdateMessage(`❌ Ошибка: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Панель администратора
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Добро пожаловать в систему управления сайтом
        </p>
      </div>

      {/* Предупреждение о роли */}
      {profile?.role !== 'admin' && (
        <Card className="p-6 border-orange-200 bg-orange-50">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-orange-800">
                Требуется роль администратора
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>
                  Ваша текущая роль: <strong>{profile?.role || 'не установлена'}</strong>
                </p>
                <p className="mt-2">
                  Для полного доступа к админ-панели вам нужна роль 'admin'.
                  Нажмите кнопку ниже, чтобы назначить себе эту роль.
                </p>
              </div>
              <div className="mt-4">
                <Button
                  onClick={grantAdminRole}
                  disabled={isUpdating}
                  variant="primary"
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {isUpdating ? 'Назначение роли...' : 'Назначить роль администратора'}
                </Button>
              </div>
              {updateMessage && (
                <div className={`mt-3 p-3 rounded-md text-sm ${
                  updateMessage.includes('✅')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {updateMessage}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Информация о профиле */}
      <Card className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Информация о профиле
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Роль</p>
            <p className="text-sm font-medium text-gray-900 capitalize">{profile?.role}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">ID пользователя</p>
            <p className="text-sm font-medium text-gray-900 font-mono">{user?.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Имя пользователя</p>
            <p className="text-sm font-medium text-gray-900">{profile?.username || 'не установлено'}</p>
          </div>
        </div>
      </Card>

      {/* Статистика */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Статистика системы
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">👥</div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">
                  Всего пользователей
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  1
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">🔗</div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">
                  Активных сессий
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  1
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">📈</div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">
                  Новых регистраций
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  0
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">⚠️</div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500 truncate">
                  Ошибок системы
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  0
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;