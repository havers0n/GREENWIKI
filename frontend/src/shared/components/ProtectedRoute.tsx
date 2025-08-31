import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false
}) => {
  const { user, isAdmin, isLoading, isInitialized } = useAuth();
  const location = useLocation();

  console.log(`🔒 ProtectedRoute for ${location.pathname}:`, {
    isLoading,
    isInitialized,
    user: user ? 'present' : 'null',
    isAdmin,
    requireAdmin
  });

  // 1. Ждем завершения инициализации и загрузки профиля
  if (!isInitialized || isLoading) {
    console.log('--> ⏳ WAITING (initialization or loading)');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <div className="ml-3 text-gray-600">Инициализация...</div>
      </div>
    );
  }

  // 2. Только ПОСЛЕ завершения загрузки проверяем аутентификацию
  if (!user) {
    console.log('--> 🔄 REDIRECTING to /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Если требуется роль админа, проверяем её
  if (requireAdmin && !isAdmin) {
    console.log('--> 🚫 REDIRECTING to /forbidden');
    return <Navigate to="/forbidden" replace />;
  }

  // 4. Если все проверки пройдены, показываем контент
  console.log('--> ✅ ACCESS GRANTED');
  return <>{children}</>;
};

export { ProtectedRoute };
