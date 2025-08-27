import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from 'pages/HomePage';
import LoginPage from 'pages/LoginPage';
import ForbiddenPage from 'pages/ForbiddenPage';
import AdminLayout from 'pages/AdminLayout';
import AdminHomePage from 'pages/AdminHomePage';
import AdminCategoriesPage from 'pages/AdminCategoriesPage';
import AdminSectionsPage from 'pages/AdminSectionsPage';
import DebugPage from 'pages/DebugPage';
import { ProtectedRoute } from 'shared/ui/molecules';
import AdminPagesPage from 'pages/AdminPagesPage';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Публичные роуты */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="/debug" element={<DebugPage />} />

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
        <Route index element={<AdminHomePage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="sections" element={<AdminSectionsPage />} />
        <Route path="pages" element={<AdminPagesPage />} />
        {/* Здесь можно добавить другие страницы админки */}
        {/* <Route path="users" element={<AdminUsersPage />} /> */}
        {/* <Route path="settings" element={<AdminSettingsPage />} /> */}
      </Route>
    </Routes>
  );
};

export default App;
