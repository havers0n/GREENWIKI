import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/contexts';
import { Button } from '../../shared/ui/atoms';

interface AdminLayoutProps {}

const AdminLayout: React.FC<AdminLayoutProps> = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Главная', href: '/admin', icon: '🏠' },
    // Здесь можно добавить другие пункты меню админки
    // { name: 'Пользователи', href: '/admin/users', icon: '👥' },
    // { name: 'Настройки', href: '/admin/settings', icon: '⚙️' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Мобильное меню */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg">
          <SidebarContent
            navigation={navigation}
            location={location}
            user={user}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Десктопное боковое меню */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:block">
        <div className="flex flex-col h-full bg-white shadow-lg">
          <SidebarContent
            navigation={navigation}
            location={location}
            user={user}
          />
        </div>
      </div>

      {/* Основная область */}
      <div className="lg:pl-64">
        {/* Верхняя панель */}
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                type="button"
                className="lg:hidden text-gray-500 hover:text-gray-900"
                onClick={() => setSidebarOpen(true)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex-1" />
              <div className="flex items-center">
                <span className="text-sm text-gray-700 mr-4">
                  Привет, {user?.email}
                </span>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="text-sm"
                >
                  Выйти
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Контент */}
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

interface SidebarContentProps {
  navigation: Array<{ name: string; href: string; icon: string }>;
  location: any;
  user: any;
  onClose?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  navigation,
  location,
  user,
  onClose
}) => {
  return (
    <>
      {/* Логотип */}
      <div className="flex items-center justify-center h-16 px-4 border-b">
        <div className="flex items-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM0 12C0 5.37 5.37 0 12 0C18.63 0 24 5.37 24 12C24 18.63 18.63 24 12 24C5.37 24 0 18.63 0 12Z" fill="#E6007A"/>
            <path d="M12 6C11.45 6 11 6.45 11 7V12C11 12.55 11.45 13 12 13C12.55 13 13 12.55 13 12V7C13 6.45 12.55 6 12 6Z" fill="#E6007A"/>
            <path d="M12 15C11.45 15 11 15.45 11 16C11 16.55 11.45 17 12 17C12.55 17 13 16.55 13 16C13 15.45 12.55 15 12 15Z" fill="#E6007A"/>
          </svg>
          <span className="ml-2 text-lg font-semibold text-gray-900">Админка</span>
        </div>
        {onClose && (
          <button
            type="button"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 lg:hidden"
            onClick={onClose}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Навигация */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-majestic-pink text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Информация о пользователе */}
      <div className="p-4 border-t">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-majestic-pink text-white rounded-full flex items-center justify-center text-sm font-medium">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.email}
            </p>
            <p className="text-xs text-gray-500 truncate">
              Администратор
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
