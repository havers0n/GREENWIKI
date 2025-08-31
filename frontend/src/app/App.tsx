import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@my-forum/ui';
import HomePage from 'pages/HomePage';
import LoginPage from 'pages/LoginPage';
import ForbiddenPage from 'pages/ForbiddenPage';
import AdminLayout from 'pages/AdminLayout';
import AdminCategoriesPage from 'pages/AdminCategoriesPage';
import AdminSectionsPage from 'pages/AdminSectionsPage';
import AdminEditorPage from 'pages/AdminEditorPage';
import AdminAnalyticsPage from 'pages/AdminAnalyticsPage';
import AdminContentPage from 'pages/AdminContentPage';
import AdminMediaPage from 'pages/AdminMediaPage';
import AdminUsersPage from 'pages/AdminUsersPage';
import DebugPage from 'pages/DebugPage';
import UIDemoPage from 'pages/UIDemoPage';
import TreeDemoPage from 'pages/TreeDemoPage';
import PerformanceTestPage from 'pages/PerformanceTestPage';
import DnDTestPage from 'pages/DnDTestPage';
import { ProtectedRoute } from 'shared/components/ProtectedRoute';
import { NotificationContainer } from 'shared/components/NotificationContainer';
import AdminPagesPage from 'pages/AdminPagesPage';

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
      {/* Контейнер для уведомлений */}
      <NotificationContainer />
    </ErrorBoundary>
  );
};

export default App;
