import React from 'react';
import { useParams } from 'react-router-dom';
import { ErrorBoundary } from '@my-forum/ui';
import NewLiveEditor from 'widgets/NewLiveEditor';

const AdminEditorPage: React.FC = () => {
  const { pageSlug } = useParams<{ pageSlug: string }>();

  // Если pageSlug не найден, используем значение по умолчанию
  const currentPageSlug = pageSlug || 'home';

  const handleEditorError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Editor Error:', {
      error: error.message,
      pageSlug: currentPageSlug,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });

    // Можно добавить отправку в мониторинг
    // sendEditorErrorToMonitoring(error, errorInfo, currentPageSlug);
  };

  return (
    <ErrorBoundary
      onError={handleEditorError}
      showDetails={process.env.NODE_ENV === 'development'}
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Ошибка редактора
            </h2>
            <p className="text-gray-600 mb-4">
              Произошла ошибка в редакторе страницы "{currentPageSlug}"
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Перезагрузить страницу
            </button>
          </div>
        </div>
      }
    >
      <NewLiveEditor pageSlug={currentPageSlug} />
    </ErrorBoundary>
  );
};

export default AdminEditorPage;
