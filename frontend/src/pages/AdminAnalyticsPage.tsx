import React from 'react';
import { Card, Typography, Button, Badge, Progress } from '@my-forum/ui';
import { useAppSelector } from 'store/hooks';
import { useAppTheme } from 'app/providers/ThemeProvider';

const AdminAnalyticsPage: React.FC = () => {
  const { mode } = useAppTheme();

  // Демо-данные (в реальном приложении будут приходить из API)
  const analyticsData = {
    totalPages: 24,
    totalBlocks: 156,
    totalUsers: 1247,
    activeUsers: 89,
    contentGrowth: 12.5,
    userGrowth: 8.3,
    recentActivity: [
      { action: 'Создание страницы', user: 'Иван Петров', time: '2 мин назад' },
      { action: 'Обновление блока', user: 'Мария Сидорова', time: '5 мин назад' },
      { action: 'Публикация контента', user: 'Алексей Иванов', time: '12 мин назад' },
      { action: 'Создание категории', user: 'Елена Козлова', time: '1 час назад' },
    ],
    topContent: [
      { title: 'Главная страница', views: 1250, growth: 15.2 },
      { title: 'О компании', views: 890, growth: 8.7 },
      { title: 'Контакты', views: 654, growth: -2.1 },
      { title: 'Блог', views: 432, growth: 22.4 },
    ]
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Typography variant="h1" className="text-3xl font-bold">
              📊 Аналитика CMS
            </Typography>
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mt-1">
              Статистика использования и производительности
            </Typography>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="secondary">
              Тема: {mode}
            </Badge>
            <Button variant="secondary" size="sm">
              Экспорт данных
            </Button>
          </div>
        </div>

        {/* Ключевые метрики */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                  Всего страниц
                </Typography>
                <Typography variant="h2" className="text-2xl font-bold">
                  {analyticsData.totalPages}
                </Typography>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                  Всего блоков
                </Typography>
                <Typography variant="h2" className="text-2xl font-bold">
                  {analyticsData.totalBlocks}
                </Typography>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🧱</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                  Пользователей
                </Typography>
                <Typography variant="h2" className="text-2xl font-bold">
                  {analyticsData.totalUsers}
                </Typography>
                <Typography variant="body2" className="text-green-600 text-sm">
                  +{analyticsData.userGrowth}% за месяц
                </Typography>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                  Активных сейчас
                </Typography>
                <Typography variant="h2" className="text-2xl font-bold">
                  {analyticsData.activeUsers}
                </Typography>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Популярный контент */}
        <Card className="p-6">
          <Typography variant="h3" className="text-xl font-semibold mb-4">
            📈 Популярный контент
          </Typography>

          <div className="space-y-4">
            {analyticsData.topContent.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <Typography variant="body1" className="font-medium">
                    {item.title}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                    {item.views} просмотров
                  </Typography>
                </div>
                <Badge variant={item.growth > 0 ? 'success' : 'error'}>
                  {item.growth > 0 ? '+' : ''}{item.growth}%
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Недавняя активность */}
        <Card className="p-6">
          <Typography variant="h3" className="text-xl font-semibold mb-4">
            🕒 Недавняя активность
          </Typography>

          <div className="space-y-3">
            {analyticsData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <Typography variant="body2" className="font-medium">
                    {activity.action}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                    {activity.user} • {activity.time}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Производительность контента */}
        <Card className="p-6">
          <Typography variant="h3" className="text-xl font-semibold mb-4">
            📊 Производительность контента
          </Typography>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <Typography variant="body2">Рост контента</Typography>
                <Typography variant="body2" className="text-green-600">
                  +{analyticsData.contentGrowth}%
                </Typography>
              </div>
              <Progress value={analyticsData.contentGrowth * 10} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Typography variant="body2">Качество контента</Typography>
                <Typography variant="body2" className="text-blue-600">
                  87%
                </Typography>
              </div>
              <Progress value={87} variant="secondary" className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Typography variant="body2">Пользовательская активность</Typography>
                <Typography variant="body2" className="text-purple-600">
                  94%
                </Typography>
              </div>
              <Progress value={94} variant="success" className="h-2" />
            </div>
          </div>
        </Card>

        {/* Система и здоровье */}
        <Card className="p-6">
          <Typography variant="h3" className="text-xl font-semibold mb-4">
            🔧 Состояние системы
          </Typography>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <Typography variant="body2" className="font-medium">
                  API Сервер
                </Typography>
              </div>
              <Badge variant="success">Онлайн</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <Typography variant="body2" className="font-medium">
                  База данных
                </Typography>
              </div>
              <Badge variant="success">Онлайн</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <Typography variant="body2" className="font-medium">
                  Кеш
                </Typography>
              </div>
              <Badge variant="warning">Перезагрузка</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <Typography variant="body2" className="font-medium">
                  CDN
                </Typography>
              </div>
              <Badge variant="success">Онлайн</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Действия */}
      <div className="mt-8 flex flex-wrap gap-4">
        <Button variant="primary">
          Создать отчет
        </Button>
        <Button variant="secondary">
          Настроить метрики
        </Button>
        <Button variant="ghost">
          Экспорт в PDF
        </Button>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
