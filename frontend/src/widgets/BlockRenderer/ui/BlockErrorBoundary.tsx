import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@my-forum/ui';

interface BlockErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  blockId?: string;
  blockType?: string;
  onRetry?: () => void;
}

interface BlockErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary для изоляции ошибок рендеринга отдельных блоков
 * Предотвращает падение всей страницы при ошибке в одном блоке
 */
export class BlockErrorBoundary extends Component<BlockErrorBoundaryProps, BlockErrorBoundaryState> {
  constructor(props: BlockErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): BlockErrorBoundaryState {
    // Обновляем состояние, чтобы показать fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Логируем ошибку для отладки
    console.error('Block rendering error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    // Сбрасываем состояние ошибки
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });

    // Вызываем callback для повторной попытки
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      // Если предоставлен кастомный fallback, используем его
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Иначе используем стандартный fallback
      return (
        <BlockErrorFallback
          blockId={this.props.blockId}
          blockType={this.props.blockType}
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Компонент-заглушка для отображения ошибки блока
 */
interface BlockErrorFallbackProps {
  blockId?: string;
  blockType?: string;
  error?: Error;
  onRetry?: () => void;
}

export const BlockErrorFallback: React.FC<BlockErrorFallbackProps> = ({
  blockId,
  blockType,
  error,
  onRetry
}) => {
  const blockName = blockType || 'Блок';
  const blockIdentifier = blockId ? ` (ID: ${blockId})` : '';

  return (
    <div className="relative p-4 border-2 border-dashed border-red-300 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-900/20">
      {/* Иконка ошибки */}
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <span className="font-medium text-red-700 dark:text-red-300">
          Ошибка в {blockName}{blockIdentifier}
        </span>
      </div>

      {/* Сообщение об ошибке */}
      <div className="text-sm text-red-600 dark:text-red-400 mb-3">
        {error?.message || 'Произошла непредвиденная ошибка при отображении блока'}
      </div>

      {/* Детали ошибки (только в development) */}
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mb-3">
          <summary className="cursor-pointer text-xs text-red-500 hover:text-red-700">
            Детали ошибки (для разработчиков)
          </summary>
          <pre className="mt-2 p-2 bg-red-100 dark:bg-red-900/50 rounded text-xs overflow-auto max-h-32">
            {error.stack}
          </pre>
        </details>
      )}

      {/* Кнопка повторной попытки */}
      {onRetry && (
        <Button
          onClick={onRetry}
          size="sm"
          variant="secondary"
          className="bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Попробовать снова
        </Button>
      )}

      {/* Подсказка для пользователя */}
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Остальные блоки страницы продолжают работать нормально.
        Попробуйте обновить страницу или обратитесь к администратору.
      </div>
    </div>
  );
};

// Экспорт компонента по умолчанию
export default BlockErrorBoundary;
