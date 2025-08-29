import React from 'react';
import { useTheme } from '../store/hooks';
import { setTheme } from '../store/slices/uiSlice';
import { useAppDispatch } from '../store/hooks';

export default function App() {
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const handleThemeChange = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">CMS с Redux Toolkit</h1>

        <div className="mb-6">
          <button
            onClick={handleThemeChange}
            className={`px-4 py-2 rounded ${
              theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            Переключить на {theme === 'light' ? 'темную' : 'светлую'} тему
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className={`p-6 rounded-lg shadow-md ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <h2 className="text-xl font-semibold mb-2">Управление контентом</h2>
            <p>Создание, редактирование и публикация контента</p>
          </div>

          <div className={`p-6 rounded-lg shadow-md ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <h2 className="text-xl font-semibold mb-2">Визуальный редактор</h2>
            <p>Drag & drop конструктор страниц</p>
          </div>

          <div className={`p-6 rounded-lg shadow-md ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <h2 className="text-xl font-semibold mb-2">Мультимедиа</h2>
            <p>Управление изображениями и файлами</p>
          </div>

          <div className={`p-6 rounded-lg shadow-md ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <h2 className="text-xl font-semibold mb-2">🎨 UI Компоненты</h2>
            <p>Демонстрация новой библиотеки компонентов</p>
            <button
              onClick={() => window.location.href = '/ui-demo'}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Посмотреть демо
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
