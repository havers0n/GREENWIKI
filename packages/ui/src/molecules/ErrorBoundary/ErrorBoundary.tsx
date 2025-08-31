import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Card } from '../../atoms/Card';
import { Button } from '../../atoms/Button';
import { Icon } from '../../atoms/Icon';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * ErrorBoundary - компонент для перехвата и обработки ошибок JavaScript в React
 *
 * Особенности:
 * - Перехватывает ошибки в дочерних компонентах
 * - Показывает user-friendly сообщение об ошибке
 * - Предоставляет кнопки для восстановления
 * - Логирует ошибки для разработчиков
 * - Поддерживает кастомный fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Вызываем callback для дополнительной обработки
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Если предоставлен кастомный fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
          <Card className="max-w-lg w-full p-6">
            <div className="text-center">
              {/* Иконка ошибки */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <Icon icon={AlertTriangle} className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>

              {/* Заголовок */}
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Что-то пошло не так
              </h1>

              {/* Описание */}
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Произошла неожиданная ошибка. Мы уже работаем над её исправлением.
              </p>

              {/* Детали ошибки (только в development или при showDetails) */}
              {this.props.showDetails && (process.env.NODE_ENV === 'development' || this.props.showDetails) && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Технические детали (для разработчиков)
                  </summary>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs font-mono overflow-auto max-h-32">
                    <div className="mb-2">
                      <strong>Ошибка:</strong> {this.state.error?.message}
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Stack trace:</strong>
                        <pre className="whitespace-pre-wrap mt-1">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Кнопки действий */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                >
                  <Icon icon={RefreshCw} className="h-4 w-4" />
                  Попробовать снова
                </Button>

                <Button
                  variant="secondary"
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2"
                >
                  <Icon icon={Home} className="h-4 w-4" />
                  На главную
                </Button>

                <Button
                  variant="ghost"
                  onClick={this.handleReload}
                  className="flex items-center gap-2"
                >
                  <Icon icon={RefreshCw} className="h-4 w-4" />
                  Перезагрузить страницу
                </Button>
              </div>

              {/* Сообщение поддержки */}
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Если проблема persists, пожалуйста, свяжитесь с поддержкой
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
