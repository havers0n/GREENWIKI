import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../widgets';
import { Button } from '@my-forum/ui';

const ForbiddenPage: React.FC = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <div className="mx-auto h-24 w-24 text-red-500">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
              Доступ запрещен
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              У вас нет достаточных прав для доступа к этой странице.
              Обратитесь к администратору для получения необходимых прав.
            </p>
          </div>
          <div className="space-y-4">
            <Link to="/">
              <Button variant="primary" className="w-full">
                Вернуться на главную
              </Button>
            </Link>
            <p className="text-xs text-gray-500">
              Если вы считаете, что это ошибка, пожалуйста, свяжитесь с поддержкой.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForbiddenPage;
