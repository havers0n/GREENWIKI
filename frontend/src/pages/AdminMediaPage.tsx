import React, { useState, useRef, useCallback } from 'react';
import { Card, Typography, Button, Input, Badge, Spinner } from '../shared/ui/atoms';
import { Progress } from '../shared/ui/atoms';

interface MediaFile {
  id: string;
  name: string;
  originalName: string;
  type: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnail?: string;
  uploadedAt: string;
  uploadedBy: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

const AdminMediaPage: React.FC = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [filter, setFilter] = useState({
    type: '',
    search: ''
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data - в продакшене заменить на API
  React.useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockFiles: MediaFile[] = [
        {
          id: '1',
          name: 'hero-image.jpg',
          originalName: 'hero-background.jpg',
          type: 'image',
          mimeType: 'image/jpeg',
          size: 2457600, // 2.4MB
          url: '/uploads/hero-image.jpg',
          thumbnail: '/uploads/thumbnails/hero-image.jpg',
          uploadedAt: '2024-01-15',
          uploadedBy: 'Admin',
          dimensions: { width: 1920, height: 1080 }
        },
        {
          id: '2',
          name: 'logo.png',
          originalName: 'company-logo.png',
          type: 'image',
          mimeType: 'image/png',
          size: 512000, // 512KB
          url: '/uploads/logo.png',
          thumbnail: '/uploads/thumbnails/logo.png',
          uploadedAt: '2024-01-14',
          uploadedBy: 'Designer',
          dimensions: { width: 500, height: 200 }
        },
        {
          id: '3',
          name: 'presentation.pdf',
          originalName: 'company-presentation.pdf',
          type: 'document',
          mimeType: 'application/pdf',
          size: 5242880, // 5MB
          url: '/uploads/presentation.pdf',
          uploadedAt: '2024-01-13',
          uploadedBy: 'Manager'
        }
      ];

      setFiles(mockFiles);
      setLoading(false);
    };

    fetchMedia();
  }, []);

  const filteredFiles = files.filter(file => {
    const matchesType = !filter.type || file.type === filter.type;
    const matchesSearch = !filter.search ||
      file.name.toLowerCase().includes(filter.search.toLowerCase()) ||
      file.originalName.toLowerCase().includes(filter.search.toLowerCase());

    return matchesType && matchesSearch;
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string, mimeType: string) => {
    if (type === 'image') return '🖼️';
    if (type === 'document') {
      if (mimeType.includes('pdf')) return '📄';
      if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
      return '📋';
    }
    if (type === 'video') return '🎥';
    if (type === 'audio') return '🎵';
    return '📎';
  };

  const getMimeTypeCategory = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
    return 'other';
  };

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 0) {
      handleUpload(selectedFiles);
    }
  }, []);

  const handleUpload = async (filesToUpload: File[]) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(progress);
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Mock successful upload
        const newFile: MediaFile = {
          id: Date.now().toString() + i,
          name: file.name.toLowerCase().replace(/[^a-z0-9.]/g, '-'),
          originalName: file.name,
          type: getMimeTypeCategory(file.type),
          mimeType: file.type,
          size: file.size,
          url: `/uploads/${file.name}`,
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: 'Current User'
        };

        setFiles(prev => [newFile, ...prev]);
      }

      setShowUpload(false);
      setUploadProgress(0);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот файл?')) return;

    try {
      // Mock delete
      await new Promise(resolve => setTimeout(resolve, 500));
      setFiles(prev => prev.filter(f => f.id !== fileId));
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Удалить ${selectedFiles.length} выбранных файлов?`)) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setFiles(prev => prev.filter(f => !selectedFiles.includes(f.id)));
      setSelectedFiles([]);
    } catch (error) {
      console.error('Bulk delete failed:', error);
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const selectAll = () => {
    setSelectedFiles(filteredFiles.map(f => f.id));
  };

  const deselectAll = () => {
    setSelectedFiles([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h1" className="text-2xl font-bold">
            Медиа библиотека
          </Typography>
          <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mt-1">
            Управляйте изображениями, документами и другими файлами
          </Typography>
        </div>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowUpload(!showUpload)}
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Загрузить файлы
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <Card className="p-6">
          <Typography variant="h3" className="font-semibold mb-4">
            Загрузка файлов
          </Typography>

          {uploading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Spinner size="md" />
                <Typography variant="body1">
                  Загрузка файлов... {uploadProgress}%
                </Typography>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <Typography variant="body1" className="mb-2">
                  Перетащите файлы сюда или нажмите для выбора
                </Typography>
                <Typography variant="body2" className="text-gray-500 dark:text-gray-400 mb-4">
                  Поддерживаются изображения, документы, видео и аудио файлы (макс. 10MB каждый)
                </Typography>
                <Button onClick={() => fileInputRef.current?.click()}>
                  Выбрать файлы
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Filters and Actions */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <Input
              placeholder="Поиск файлов..."
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              className="sm:w-64"
            />

            <Select
              value={filter.type}
              onChange={(value) => setFilter(prev => ({ ...prev, type: value }))}
              placeholder="Все типы"
            >
              <option value="">Все типы</option>
              <option value="image">Изображения</option>
              <option value="document">Документы</option>
              <option value="video">Видео</option>
              <option value="audio">Аудио</option>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            {selectedFiles.length > 0 && (
              <div className="flex items-center gap-2 mr-4">
                <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                  Выбрано: {selectedFiles.length}
                </Typography>
                <Button variant="ghost" size="sm" onClick={deselectAll}>
                  Снять выделение
                </Button>
                <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                  Удалить
                </Button>
              </div>
            )}

            <div className="flex border border-gray-200 dark:border-gray-600 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-lg ${
                  viewMode === 'grid'
                    ? 'bg-pink-500 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-lg ${
                  viewMode === 'list'
                    ? 'bg-pink-500 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Files Grid/List */}
      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
            <span className="ml-3">Загрузка медиа файлов...</span>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`relative group border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedFiles.includes(file.id)
                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => toggleFileSelection(file.id)}
                  >
                    {/* Selection checkbox */}
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => {}} // Controlled by onClick
                        className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"
                      />
                    </div>

                    {/* File preview */}
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      {file.type === 'image' && file.thumbnail ? (
                        <img
                          src={file.thumbnail}
                          alt={file.originalName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-4xl">{getFileIcon(file.type, file.mimeType)}</div>
                      )}
                    </div>

                    {/* File info */}
                    <div className="p-3 bg-white dark:bg-gray-800">
                      <Typography variant="body2" className="font-medium truncate" title={file.originalName}>
                        {file.originalName}
                      </Typography>
                      <Typography variant="body2" className="text-gray-500 dark:text-gray-400 text-xs">
                        {formatFileSize(file.size)}
                      </Typography>
                    </div>

                    {/* Actions overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(file.url, '_blank');
                          }}
                          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <svg className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(file.url);
                          }}
                          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <svg className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(file.id);
                          }}
                          className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                        >
                          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      selectedFiles.includes(file.id) ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-500' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => toggleFileSelection(file.id)}
                      className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"
                    />

                    <div className="text-2xl">{getFileIcon(file.type, file.mimeType)}</div>

                    <div className="flex-1 min-w-0">
                      <Typography variant="body1" className="font-medium truncate">
                        {file.originalName}
                      </Typography>
                      <Typography variant="body2" className="text-gray-500 dark:text-gray-400">
                        {file.name} • {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                      </Typography>
                    </div>

                    <Badge variant="secondary" className="capitalize">
                      {file.type}
                    </Badge>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        Просмотр
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(file.url)}
                      >
                        Копировать URL
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(file.id)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredFiles.length === 0 && (
              <div className="text-center py-12">
                <Typography variant="h3" className="text-gray-500 dark:text-gray-400 mb-2">
                  Файлы не найдены
                </Typography>
                <Typography variant="body2" className="text-gray-400 dark:text-gray-500">
                  Попробуйте изменить фильтры или загрузите новые файлы
                </Typography>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default AdminMediaPage;
