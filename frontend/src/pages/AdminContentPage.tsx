import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Input, Select, Badge, Spinner } from '@my-forum/ui';
import { useNavigate, useParams } from 'react-router-dom';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  type: 'page' | 'post' | 'article';
  status: 'draft' | 'published' | 'archived';
  author: string;
  createdAt: string;
  updatedAt: string;
  excerpt?: string;
}

const AdminContentPage: React.FC = () => {
  const navigate = useNavigate();
  const { action } = useParams();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: '',
    status: '',
    search: ''
  });

  // Mock data - в продакшене заменить на API
  useEffect(() => {
    const fetchContents = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockContents: ContentItem[] = [
        {
          id: '1',
          title: 'Добро пожаловать на наш сайт',
          slug: 'welcome',
          type: 'page',
          status: 'published',
          author: 'Admin',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-15',
          excerpt: 'Главная страница сайта с приветствием'
        },
        {
          id: '2',
          title: 'Руководство по использованию',
          slug: 'guide',
          type: 'article',
          status: 'draft',
          author: 'Editor',
          createdAt: '2024-01-14',
          updatedAt: '2024-01-16',
          excerpt: 'Подробное руководство для новых пользователей'
        },
        {
          id: '3',
          title: 'Новости компании',
          slug: 'company-news',
          type: 'post',
          status: 'published',
          author: 'Manager',
          createdAt: '2024-01-13',
          updatedAt: '2024-01-13',
          excerpt: 'Последние новости и обновления'
        }
      ];

      setContents(mockContents);
      setLoading(false);
    };

    fetchContents();
  }, []);

  const filteredContents = contents.filter(content => {
    const matchesType = !filter.type || content.type === filter.type;
    const matchesStatus = !filter.status || content.status === filter.status;
    const matchesSearch = !filter.search ||
      content.title.toLowerCase().includes(filter.search.toLowerCase()) ||
      content.slug.toLowerCase().includes(filter.search.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge tone="green">Опубликован</Badge>;
      case 'draft':
        return <Badge tone="neutral">Черновик</Badge>;
      case 'archived':
        return <Badge tone="red">Архивирован</Badge>;
      default:
        return <Badge>Неизвестно</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page':
        return '📄';
      case 'post':
        return '📰';
      case 'article':
        return '📝';
      default:
        return '📋';
    }
  };

  if (action === 'new') {
    return <ContentEditorPage />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h1" className="text-2xl font-bold">
            Управление контентом
          </Typography>
          <Typography variant="body" className="text-gray-600 dark:text-gray-400 mt-1">
            Создавайте, редактируйте и управляйте вашим контентом
          </Typography>
        </div>

        <Button onClick={() => navigate('/admin/content/new')} className="flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Создать контент
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Поиск по названию или slug..."
            value={filter.search}
            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
          />

          <Select
            value={filter.type}
            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="">Все типы</option>
            <option value="page">Страницы</option>
            <option value="post">Посты</option>
            <option value="article">Статьи</option>
          </Select>

          <Select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="">Все статусы</option>
            <option value="draft">Черновики</option>
            <option value="published">Опубликованные</option>
            <option value="archived">Архивированные</option>
          </Select>

          <Button
            variant="secondary"
            onClick={() => setFilter({ type: '', status: '', search: '' })}
          >
            Сбросить
          </Button>
        </div>
      </Card>

      {/* Content List */}
      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
            <span className="ml-3">Загрузка контента...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContents.length === 0 ? (
              <div className="text-center py-12">
                <Typography variant="h3" className="text-gray-500 dark:text-gray-400 mb-2">
                  Контент не найден
                </Typography>
                <Typography variant="body" className="text-gray-400 dark:text-gray-500">
                  Попробуйте изменить фильтры или создайте новый контент
                </Typography>
              </div>
            ) : (
              filteredContents.map((content) => (
                <div
                  key={content.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-2xl">{getTypeIcon(content.type)}</div>

                    <div className="flex-1 min-w-0">
                      <Typography variant="h4" className="font-semibold truncate">
                        {content.title}
                      </Typography>
                      <div className="flex items-center gap-2 mt-1">
                        <Typography variant="body" className="text-gray-500 dark:text-gray-400">
                          /{content.slug}
                        </Typography>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <Typography variant="body" className="text-gray-500 dark:text-gray-400">
                          {content.author}
                        </Typography>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <Typography variant="body" className="text-gray-500 dark:text-gray-400">
                          {new Date(content.updatedAt).toLocaleDateString()}
                        </Typography>
                      </div>
                      {content.excerpt && (
                        <Typography variant="body" className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {content.excerpt}
                        </Typography>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(content.status)}

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/content/edit/${content.id}`)}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/content/${content.id}`)}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

// WYSIWYG Content Editor Component
const ContentEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    type: 'page' as 'page' | 'post' | 'article',
    status: 'draft' as 'draft' | 'published',
    content: ''
  });
  const [saving, setSaving] = useState(false);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-zа-я0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Content saved:', formData);
      navigate('/admin/content');
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h1" className="text-2xl font-bold">
            Создание контента
          </Typography>
          <Typography variant="body" className="text-gray-600 dark:text-gray-400 mt-1">
            Создайте новый контент с помощью WYSIWYG редактора
          </Typography>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/admin/content')}>
            Отмена
          </Button>
          <Button onClick={handleSave} loading={saving}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </div>

      {/* Editor Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <Input
                label="Заголовок"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Введите заголовок контента"
                required
              />

              <Input
                label="Slug (URL)"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="url-friendly-identifier"
                required
              />

              {/* WYSIWYG Editor Placeholder */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Содержимое
                </label>
                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 min-h-[400px] bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <Typography variant="body" className="mb-2">
                        WYSIWYG Редактор
                      </Typography>
                      <Typography variant="body">
                        Здесь будет интеграция с Quill, TinyMCE или другим WYSIWYG редактором
                      </Typography>
                      <textarea
                        className="mt-4 w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Начните писать ваш контент здесь..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Settings */}
          <Card className="p-6">
            <Typography variant="h3" className="font-semibold mb-4">
              Настройки
            </Typography>

            <div className="space-y-4">
              <Select
                label="Тип контента"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'page' | 'post' | 'article' }))}
              >
                <option value="page">Страница</option>
                <option value="post">Пост</option>
                <option value="article">Статья</option>
              </Select>

              <Select
                label="Статус"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
              >
                <option value="draft">Черновик</option>
                <option value="published">Опубликовать</option>
              </Select>
            </div>
          </Card>

          {/* Preview */}
          <Card className="p-6">
            <Typography variant="h3" className="font-semibold mb-4">
              Предпросмотр
            </Typography>

            <div className="space-y-2">
              <Typography variant="body" className="text-gray-600 dark:text-gray-400">
                Заголовок:
              </Typography>
              <Typography variant="body" className="font-medium">
                {formData.title || 'Без заголовка'}
              </Typography>

              <Typography variant="body" className="text-gray-600 dark:text-gray-400">
                Slug:
              </Typography>
              <Typography variant="body" className="font-mono text-sm">
                /{formData.slug || 'без-slug'}
              </Typography>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminContentPage;
