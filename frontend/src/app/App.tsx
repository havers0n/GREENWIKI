import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@my-forum/ui';

// Ленивая загрузка публичных страниц (быстрая загрузка)
const HomePage = lazy(() => import('pages/HomePage'));
const LoginPage = lazy(() => import('pages/LoginPage'));
const ForbiddenPage = lazy(() => import('pages/ForbiddenPage'));

// Ленивая загрузка админ-страниц (тяжелые, загружаются по требованию)
const AdminLayout = lazy(() => import('pages/AdminLayout'));
const AdminCategoriesPage = lazy(() => import('pages/AdminCategoriesPage'));
const AdminSectionsPage = lazy(() => import('pages/AdminSectionsPage'));
const AdminEditorPage = lazy(() => import('pages/AdminEditorPage'));
const AdminAnalyticsPage = lazy(() => import('pages/AdminAnalyticsPage'));
const AdminContentPage = lazy(() => import('pages/AdminContentPage'));
const AdminMediaPage = lazy(() => import('pages/AdminMediaPage'));
const AdminUsersPage = lazy(() => import('pages/AdminUsersPage'));
const AdminPagesPage = lazy(() => import('pages/AdminPagesPage'));

// Ленивая загрузка демо и debug страниц
const DebugPage = lazy(() => import('pages/DebugPage'));
const UIDemoPage = lazy(() => import('pages/UIDemoPage'));
const TreeDemoPage = lazy(() => import('pages/TreeDemoPage'));
const PerformanceTestPage = lazy(() => import('pages/PerformanceTestPage'));
const DnDTestPage = lazy(() => import('pages/DnDTestPage'));

// Синхронная загрузка критических компонентов
import { ProtectedRoute } from 'shared/components/ProtectedRoute';
import { NotificationContainer } from 'shared/components/NotificationContainer';

const App: React.FC = () => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Логируем ошибки для мониторинга
    console.error('Application Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });

    // В будущем здесь можно добавить отправку ошибок в сервис мониторинга
    // sendToMonitoringService(error, errorInfo);
  };

  return (
    <ErrorBoundary
      onError={handleError}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка...</p>
          </div>
        </div>
      }>
        <Routes>
        {/* Публичные роуты */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/debug" element={<DebugPage />} />
        <Route path="/ui-demo" element={<UIDemoPage />} />
        <Route path="/tree-demo" element={<TreeDemoPage />} />
        <Route path="/performance-test" element={<PerformanceTestPage />} />
        <Route path="/dnd-test" element={<DnDTestPage />} />

        {/* Защищенные роуты админки */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Вложенные роуты админки */}
          <Route index element={<Navigate to="/admin/analytics" replace />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="content" element={<AdminContentPage />} />
          <Route path="content/new" element={<AdminContentPage />} />
          <Route path="content/edit/:id" element={<AdminContentPage />} />
          <Route path="media" element={<AdminMediaPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/new" element={<AdminUsersPage />} />
          <Route path="users/edit/:id" element={<AdminUsersPage />} />
          <Route path="editor/:pageSlug" element={<AdminEditorPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="sections" element={<AdminSectionsPage />} />
          <Route path="pages" element={<AdminPagesPage />} />
        </Route>
        </Routes>
      </Suspense>
      {/* Контейнер для уведомлений */}
      <NotificationContainer />
    </ErrorBoundary>
  );
};

export default App;
