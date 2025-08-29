import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/contexts';
import { Button } from '../../shared/ui/atoms';
import { ThemeToggle } from '../../shared/ui/molecules';
import { Badge } from '../../shared/ui/atoms';

interface AdminLayoutProps {}

const AdminLayout: React.FC<AdminLayoutProps> = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    content: 0,
    users: 0,
    media: 0,
    notifications: 0
  });

  // Получаем статистику (в реальном приложении это будет API call)
  useEffect(() => {
    // Mock data - в продакшене заменить на реальный API
    setStats({
      content: 24,
      users: 1247,
      media: 89,
      notifications: 3
    });
  }, []);

  const navigation = [
    { name: 'Дашборд', href: '/admin/analytics', icon: '📊', badge: null },
    { name: 'Контент', href: '/admin/content', icon: '📝', badge: stats.content },
    { name: 'Медиа', href: '/admin/media', icon: '🖼️', badge: stats.media },
    { name: 'Пользователи', href: '/admin/users', icon: '👥', badge: stats.users },
    { name: 'Категории', href: '/admin/categories', icon: '🗂️', badge: null },
    { name: 'Секции', href: '/admin/sections', icon: '📚', badge: null },
    { name: 'Страницы', href: '/admin/pages', icon: '📄', badge: null },
    { name: 'Редактор', href: '/admin/editor/home', icon: '✏️', badge: null },
  ];

  const quickActions = [
    { name: 'Создать страницу', action: () => navigate('/admin/content/new'), icon: '➕' },
    { name: 'Загрузить файл', action: () => navigate('/admin/media'), icon: '📤' },
    { name: 'Добавить пользователя', action: () => navigate('/admin/users/new'), icon: '👤' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Мобильное меню */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/25" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 shadow-lg">
          <SidebarContent
            navigation={navigation}
            location={location}
            user={user}
            quickActions={quickActions}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Десктопное боковое меню */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:block">
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 shadow-lg">
          <SidebarContent
            navigation={navigation}
            location={location}
            user={user}
            quickActions={quickActions}
          />
        </div>
      </div>

      {/* Основная область */}
      <div className="lg:pl-64">
        {/* Верхняя панель */}
        <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="lg:hidden text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setSidebarOpen(true)}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Быстрые действия */}
                <div className="hidden md:flex items-center gap-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={action.action}
                      className="text-xs px-3 py-1 h-8"
                    >
                      <span className="mr-1">{action.icon}</span>
                      {action.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Уведомления */}
                <button className="relative p-2 text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5v-5a5 5 0 00-10 0v5l-5 5h5m0 0v2a2 2 0 004 0v-2m0 0h-4" />
                  </svg>
                  {stats.notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs">
                      {stats.notifications}
                    </Badge>
                  )}
                </button>

                <ThemeToggle />

                {/* Профиль пользователя */}
                <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-700 pl-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user?.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Администратор
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-sm"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Выйти
                  </Button>
                </div>
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
  quickActions: Array<{ name: string; action: () => void; icon: string }>;
  onClose?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  navigation,
  location,
  user,
  quickActions,
  onClose
}) => {
  return (
    <>
      {/* Логотип */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM0 12C0 5.37 5.37 0 12 0C18.63 0 24 5.37 24 12C24 18.63 18.63 24 12 24C5.37 24 0 18.63 0 12Z" fill="#E6007A"/>
            <path d="M12 6C11.45 6 11 6.45 11 7V12C11 12.55 11.45 13 12 13C12.55 13 13 12.55 13 12V7C13 6.45 12.55 6 12 6Z" fill="#E6007A"/>
            <path d="M12 15C11.45 15 11 15.45 11 16C11 16.55 11.45 17 12 17C12.55 17 13 16.55 13 16C13 15.45 12.55 15 12 15Z" fill="#E6007A"/>
          </svg>
          <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-gray-100">Админка</span>
        </div>
        {onClose && (
          <button
            type="button"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 lg:hidden"
            onClick={onClose}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Навигация */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href ||
                          location.pathname.startsWith(item.href + '/') ||
                          (item.href === '/admin/content' && location.pathname.startsWith('/admin/content')) ||
                          (item.href === '/admin/users' && location.pathname.startsWith('/admin/users'));
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
            >
              <span className={`mr-3 text-lg transition-transform group-hover:scale-110 ${
                isActive ? 'animate-pulse' : ''
              }`}>
                {item.icon}
              </span>
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <Badge
                  variant={item.badge > 0 ? 'success' : 'secondary'}
                  className="ml-2 text-xs px-2 py-0.5"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Быстрые действия в сайдбаре */}
      <div className="px-4 pb-4">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Быстрые действия
        </div>
        <div className="space-y-1">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.action();
                onClose?.();
              }}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white rounded-lg transition-colors"
            >
              <span className="mr-3">{action.icon}</span>
              {action.name}
            </button>
          ))}
        </div>
      </div>

      {/* Информация о пользователе */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-majestic-pink text-white rounded-full flex items-center justify-center text-sm font-medium">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              Администратор
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
