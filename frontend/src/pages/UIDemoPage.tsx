import React from 'react';
import {
  Button,
  Input,
  Card,
  Typography,
  Badge,
  Progress,
  Dropdown,
  ThemeToggle,
  useToast
} from 'shared/ui/integration';
import { useAppTheme } from 'app/providers/ThemeProvider';
import { useAppSelector } from 'store/hooks';
import { useNewUI } from 'shared/ui/integration';

const UIDemoPage: React.FC = () => {
  const { mode, toggleTheme } = useAppTheme();
  const { addNotification } = useToast();
  const { isUsingNewComponent, getMigrationReadyComponents } = useNewUI();

  // Получаем данные из Redux
  const uiState = useAppSelector(state => state.ui);
  const userState = useAppSelector(state => state.user);

  const handleButtonClick = () => {
    addNotification({
      type: 'success',
      title: 'Успех!',
      message: 'Компонент работает корректно',
    });
  };

  const handleThemeToggle = () => {
    toggleTheme();
    addNotification({
      type: 'info',
      title: 'Тема изменена',
      message: `Переключено на ${mode === 'light' ? 'темную' : 'светлую'} тему`,
    });
  };

  const readyComponents = getMigrationReadyComponents();

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h1" className="text-3xl font-bold mb-2">
              🎨 Демонстрация UI компонентов
            </Typography>
            <Typography variant="body1" className="text-gray-600 dark:text-gray-400">
              Интеграция новой UI библиотеки @my-forum/ui
            </Typography>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary">
              Тема: {mode}
            </Badge>
            <ThemeToggle />
          </div>
        </div>

        {/* Migration Status */}
        <Card className="p-6">
          <Typography variant="h2" className="text-xl font-semibold mb-4">
            🚀 Статус миграции компонентов
          </Typography>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {readyComponents.map(component => (
              <div key={component} className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <Typography variant="body2">
                  {component}: Новая версия
                </Typography>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Typography variant="body2">
              ✅ {readyComponents.length} компонентов мигрировано на новую UI библиотеку
            </Typography>
          </div>
        </Card>

        {/* Components Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Buttons */}
          <Card className="p-6">
            <Typography variant="h3" className="text-lg font-semibold mb-4">
              🔘 Кнопки (Buttons)
            </Typography>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleButtonClick}>
                  Основная
                </Button>
                <Button variant="secondary">
                  Вторичная
                </Button>
                <Button variant="danger">
                  Опасная
                </Button>
                <Button variant="ghost">
                  Призрачная
                </Button>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="sm">Маленькая</Button>
                <Button size="md">Средняя</Button>
                <Button size="lg">Большая</Button>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button loading>Загрузка</Button>
                <Button disabled>Отключена</Button>
              </div>
            </div>
          </Card>

          {/* Form Elements */}
          <Card className="p-6">
            <Typography variant="h3" className="text-lg font-semibold mb-4">
              📝 Формы (Forms)
            </Typography>

            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                defaultValue="user@example.com"
              />

              <Input
                label="Пароль"
                type="password"
                placeholder="••••••••"
              />

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <Typography variant="body2">Запомнить меня</Typography>
                </label>
              </div>
            </div>
          </Card>

          {/* Progress & Badges */}
          <Card className="p-6">
            <Typography variant="h3" className="text-lg font-semibold mb-4">
              📊 Прогресс и значки
            </Typography>

            <div className="space-y-4">
              <div>
                <Typography variant="body2" className="mb-2">Прогресс загрузки:</Typography>
                <Progress value={75} className="w-full" />
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge>По умолчанию</Badge>
                <Badge variant="secondary">Вторичный</Badge>
                <Badge variant="success">Успех</Badge>
                <Badge variant="warning">Предупреждение</Badge>
                <Badge variant="error">Ошибка</Badge>
              </div>
            </div>
          </Card>

          {/* Dropdown */}
          <Card className="p-6">
            <Typography variant="h3" className="text-lg font-semibold mb-4">
              📋 Выпадающий список
            </Typography>

            <Dropdown
              options={[
                { value: 'option1', label: 'Вариант 1' },
                { value: 'option2', label: 'Вариант 2' },
                { value: 'option3', label: 'Вариант 3' },
              ]}
              placeholder="Выберите вариант"
              onChange={(value) => console.log('Selected:', value)}
            />
          </Card>
        </div>

        {/* State Info */}
        <Card className="p-6">
          <Typography variant="h2" className="text-xl font-semibold mb-4">
            📊 Состояние приложения
          </Typography>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Typography variant="h4" className="font-semibold mb-2">UI State</Typography>
              <Typography variant="body2">Тема: {uiState.theme}</Typography>
              <Typography variant="body2">Sidebar: {uiState.sidebar.open ? 'Открыт' : 'Закрыт'}</Typography>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Typography variant="h4" className="font-semibold mb-2">User State</Typography>
              <Typography variant="body2">Аутентифицирован: {userState.isAuthenticated ? 'Да' : 'Нет'}</Typography>
              <Typography variant="body2">Пользователь: {userState.currentUser?.username || 'Не авторизован'}</Typography>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Typography variant="h4" className="font-semibold mb-2">Notifications</Typography>
              <Typography variant="body2">Активных: {uiState.notifications.length}</Typography>
              <Typography variant="body2">Глобальная загрузка: {uiState.loading.global ? 'Да' : 'Нет'}</Typography>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Button onClick={handleThemeToggle} variant="secondary">
            Переключить тему ({mode})
          </Button>

          <Button onClick={handleButtonClick} variant="primary">
            Показать уведомление
          </Button>

          <Button
            onClick={() => window.location.href = '/admin'}
            variant="ghost"
          >
            Перейти в админку
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UIDemoPage;
