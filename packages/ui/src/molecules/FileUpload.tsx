import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, FileText, Video, Archive } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Progress } from '../atoms/Progress';
import { cn } from '../lib/utils';

export interface FileUploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  url?: string;
}

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // в байтах
  maxFiles?: number;
  onFilesSelected: (files: File[]) => void;
  onUploadProgress?: (fileId: string, progress: number) => void;
  onUploadComplete?: (fileId: string, url: string) => void;
  onUploadError?: (fileId: string, error: string) => void;
  onRemove?: (fileId: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  dragAndDrop?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  multiple = false,
  maxSize,
  maxFiles = 10,
  onFilesSelected,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  onRemove,
  className,
  disabled = false,
  placeholder = 'Выберите файлы или перетащите сюда',
  dragAndDrop = true,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (file: File) => {
    const type = file.type;

    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.includes('pdf') || type.includes('document')) return FileText;
    if (type.includes('zip') || type.includes('rar')) return Archive;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `Файл слишком большой. Максимальный размер: ${formatFileSize(maxSize)}`;
    }

    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type.match(type.replace('*', '.*'));
      });

      if (!isAccepted) {
        return `Неподдерживаемый тип файла. Разрешены: ${accept}`;
      }
    }

    return null;
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Проверка количества файлов
    if (!multiple && fileArray.length > 1) {
      errors.push('Разрешено выбрать только один файл');
      return;
    }

    if (maxFiles && uploadedFiles.length + fileArray.length > maxFiles) {
      errors.push(`Максимум ${maxFiles} файлов`);
      return;
    }

    // Валидация файлов
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      // Можно добавить toast уведомления здесь
      console.warn('File validation errors:', errors);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);

      // Добавляем файлы в локальное состояние для отображения
      const newUploadItems: FileUploadItem[] = validFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: 'uploading' as const,
      }));

      setUploadedFiles(prev => [...prev, ...newUploadItems]);

      // Имитация загрузки (в реальном приложении здесь будет API вызов)
      newUploadItems.forEach(item => {
        simulateUpload(item.id);
      });
    }
  }, [multiple, maxFiles, uploadedFiles.length, onFilesSelected]);

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;

      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        setUploadedFiles(prev =>
          prev.map(item =>
            item.id === fileId
              ? { ...item, progress: 100, status: 'completed', url: `uploaded-${fileId}` }
              : item
          )
        );

        onUploadComplete?.(fileId, `uploaded-${fileId}`);
      } else {
        setUploadedFiles(prev =>
          prev.map(item =>
            item.id === fileId ? { ...item, progress } : item
          )
        );

        onUploadProgress?.(fileId, progress);
      }
    }, 200);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFiles(event.target.files);
    }
    // Сбрасываем input для возможности повторного выбора того же файла
    event.target.value = '';
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    if (event.dataTransfer.files) {
      handleFiles(event.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(item => item.id !== fileId));
    onRemove?.(fileId);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Область загрузки */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-500'
        )}
        onDrop={dragAndDrop ? handleDrop : undefined}
        onDragOver={dragAndDrop ? handleDragOver : undefined}
        onDragLeave={dragAndDrop ? handleDragLeave : undefined}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />

        {React.createElement(Upload as any, { className: "mx-auto h-12 w-12 text-gray-400" })}

        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {placeholder}
          </p>

          {accept && (
            <p className="text-xs text-gray-500 mt-1">
              Поддерживаемые форматы: {accept}
            </p>
          )}

          {maxSize && (
            <p className="text-xs text-gray-500">
              Максимальный размер: {formatFileSize(maxSize)}
            </p>
          )}
        </div>
      </div>

      {/* Список загруженных файлов */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((item) => {
            const FileIcon = getFileIcon(item.file);

            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-center space-x-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800',
                  item.status === 'error' && 'border-red-300 bg-red-50 dark:bg-red-900/20',
                  item.status === 'completed' && 'border-green-300 bg-green-50 dark:bg-green-900/20'
                )}
              >
                {React.createElement(FileIcon as any, { className: "h-8 w-8 text-gray-400 flex-shrink-0" })}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {item.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(item.file.size)}
                  </p>

                  {item.status === 'uploading' && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round(item.progress)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {item.error && (
                    <p className="text-xs text-red-600 mt-1">
                      {item.error}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(item.id)}
                  className="p-1 h-auto"
                >
                  {React.createElement(X as any, { className: "h-4 w-4" })}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
