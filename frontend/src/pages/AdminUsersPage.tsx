import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Input, Select, Badge, Spinner } from '@my-forum/ui';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'editor' | 'author' | 'viewer';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

const AdminUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filter, setFilter] = useState({
    role: '',
    status: '',
    search: ''
  });

  // Mock data - в продакшене заменить на API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockUsers: User[] = [
        {
          id: '1',
          email: 'admin@example.com',
          username: 'admin',
          firstName: 'Администратор',
          lastName: 'Системы',
          role: 'admin',
          isActive: true,
          lastLoginAt: '2024-01-15T10:30:00Z',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-15'
        },
        {
          id: '2',
          email: 'editor@example.com',
          username: 'editor',
          firstName: 'Главный',
          lastName: 'Редактор',
          role: 'editor',
          isActive: true,
          lastLoginAt: '2024-01-14T16:45:00Z',
          createdAt: '2024-01-02',
          updatedAt: '2024-01-14'
        },
        {
          id: '3',
          email: 'author@example.com',
          username: 'author',
          firstName: 'Автор',
          lastName: 'Контента',
          role: 'author',
          isActive: true,
          lastLoginAt: '2024-01-13T09:15:00Z',
          createdAt: '2024-01-03',
          updatedAt: '2024-01-13'
        },
        {
          id: '4',
          email: 'viewer@example.com',
          username: 'viewer',
          firstName: 'Читатель',
          lastName: 'Сайта',
          role: 'viewer',
          isActive: false,
          createdAt: '2024-01-04',
          updatedAt: '2024-01-04'
        }
      ];

      setUsers(mockUsers);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesRole = !filter.role || user.role === filter.role;
    const matchesStatus = !filter.status ||
      (filter.status === 'active' && user.isActive) ||
      (filter.status === 'inactive' && !user.isActive);
    const matchesSearch = !filter.search ||
      user.email.toLowerCase().includes(filter.search.toLowerCase()) ||
      user.username?.toLowerCase().includes(filter.search.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(filter.search.toLowerCase());

    return matchesRole && matchesStatus && matchesSearch;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="error">Администратор</Badge>;
      case 'editor':
        return <Badge variant="warning">Редактор</Badge>;
      case 'author':
        return <Badge variant="success">Автор</Badge>;
      case 'viewer':
        return <Badge variant="secondary">Читатель</Badge>;
      default:
        return <Badge>Неизвестно</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean, lastLoginAt?: string) => {
    if (!isActive) {
      return <Badge variant="secondary">Неактивен</Badge>;
    }

    if (lastLoginAt) {
      const lastLogin = new Date(lastLoginAt);
      const now = new Date();
      const daysSinceLogin = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceLogin <= 1) {
        return <Badge variant="success">Онлайн</Badge>;
      } else if (daysSinceLogin <= 7) {
        return <Badge variant="warning">Недавно</Badge>;
      }
    }

    return <Badge variant="secondary">Активен</Badge>;
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setUsers(prev => prev.map(user =>
        user.id === userId
          ? { ...user, isActive: !currentStatus, updatedAt: new Date().toISOString().split('T')[0] }
          : user
      ));
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.')) return;

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setUsers(prev => prev.filter(user => user.id !== userId));
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Удалить ${selectedUsers.length} выбранных пользователей? Это действие нельзя отменить.`)) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
      setSelectedUsers([]);
    } catch (error) {
      console.error('Failed to bulk delete users:', error);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAll = () => {
    setSelectedUsers(filteredUsers.map(u => u.id));
  };

  const deselectAll = () => {
    setSelectedUsers([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h1" className="text-2xl font-bold">
            Управление пользователями
          </Typography>
          <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mt-1">
            Управляйте пользователями, их ролями и доступом к системе
          </Typography>
        </div>

        <Button onClick={() => navigate('/admin/users/new')} className="flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Добавить пользователя
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                Всего пользователей
              </Typography>
              <Typography variant="h2" className="text-2xl font-bold">
                {users.length}
              </Typography>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                Активных
              </Typography>
              <Typography variant="h2" className="text-2xl font-bold">
                {users.filter(u => u.isActive).length}
              </Typography>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                Администраторов
              </Typography>
              <Typography variant="h2" className="text-2xl font-bold">
                {users.filter(u => u.role === 'admin').length}
              </Typography>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👑</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                Новых за неделю
              </Typography>
              <Typography variant="h2" className="text-2xl font-bold">
                2
              </Typography>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🆕</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <Input
              placeholder="Поиск пользователей..."
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              className="sm:w-64"
            />

            <Select
              value={filter.role}
              onChange={(value) => setFilter(prev => ({ ...prev, role: value }))}
              placeholder="Все роли"
            >
              <option value="">Все роли</option>
              <option value="admin">Администраторы</option>
              <option value="editor">Редакторы</option>
              <option value="author">Авторы</option>
              <option value="viewer">Читатели</option>
            </Select>

            <Select
              value={filter.status}
              onChange={(value) => setFilter(prev => ({ ...prev, status: value }))}
              placeholder="Все статусы"
            >
              <option value="">Все статусы</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2 mr-4">
                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                  Выбрано: {selectedUsers.length}
                </Typography>
                <Button variant="ghost" size="sm" onClick={deselectAll}>
                  Снять выделение
                </Button>
                <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                  Удалить
                </Button>
              </div>
            )}

            <Button variant="secondary" size="sm" onClick={selectAll}>
              Выбрать все
            </Button>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
            <span className="ml-3">Загрузка пользователей...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={selectedUsers.length === filteredUsers.length ? deselectAll : selectAll}
                      className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                    Пользователь
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                    Роль
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                    Статус
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                    Последний вход
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                    Создан
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                        </div>
                        <div>
                          <Typography variant="body1" className="font-medium">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.email
                            }
                          </Typography>
                          <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                            {user.username ? `@${user.username}` : user.email}
                          </Typography>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(user.isActive, user.lastLoginAt)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                        >
                          {user.isActive ? 'Деактивировать' : 'Активировать'}
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Typography variant="body2" className="text-gray-900 dark:text-gray-100">
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleString('ru-RU')
                          : 'Никогда'
                        }
                      </Typography>
                    </td>
                    <td className="px-4 py-4">
                      <Typography variant="body2" className="text-gray-900 dark:text-gray-100">
                        {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                      </Typography>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Typography variant="h3" className="text-gray-500 dark:text-gray-400 mb-2">
                  Пользователи не найдены
                </Typography>
                <Typography variant="body2" className="text-gray-400 dark:text-gray-500">
                  Попробуйте изменить фильтры или добавьте новых пользователей
                </Typography>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminUsersPage;
