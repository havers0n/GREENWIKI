import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts';
import { supabase } from '../../../supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const [roleCheckLoading, setRoleCheckLoading] = useState(false);

  useEffect(() => {
    // Если требуется роль админа и профиль еще не загружен, обновляем его
    if (requireAdmin && user && !profile && !loading) {
      setRoleCheckLoading(true);
      // Профиль должен быть уже загружен в AuthContext, но на всякий случай
      const fetchProfile = async () => {
        try {
          const { error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching profile for role check:', error);
          }
        } catch (error) {
          console.error('Error fetching profile for role check:', error);
        } finally {
          setRoleCheckLoading(false);
        }
      };

      fetchProfile();
    } else {
      setRoleCheckLoading(false);
    }
  }, [requireAdmin, user, profile, loading]);

  // Показываем загрузку пока идет проверка аутентификации или роли
  if (loading || roleCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если требуется роль админа, проверяем её
  if (requireAdmin) {
    // Если профиль еще не загружен, показываем загрузку
    if (!profile) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Проверка прав доступа...</div>
        </div>
      );
    }

    // Если пользователь не админ, перенаправляем на страницу "Доступ запрещен"
    if (profile.role !== 'admin') {
      return <Navigate to="/forbidden" replace />;
    }
  }

  // Все проверки пройдены, рендерим дочерние компоненты
  return <>{children}</>;
};

export default ProtectedRoute;
