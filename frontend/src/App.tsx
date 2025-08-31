export default function App() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">CMS с Redux Toolkit</h1>

        <div className="mb-6">
          <button
            className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
          >
            Привет, мир!
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg shadow-md bg-gray-50">
            <h2 className="text-xl font-semibold mb-2">Управление контентом</h2>
            <p>Создание, редактирование и публикация контента</p>
          </div>

          <div className="p-6 rounded-lg shadow-md bg-gray-50">
            <h2 className="text-xl font-semibold mb-2">Визуальный редактор</h2>
            <p>Drag & drop конструктор страниц</p>
          </div>

          <div className="p-6 rounded-lg shadow-md bg-gray-50">
            <h2 className="text-xl font-semibold mb-2">Мультимедиа</h2>
            <p>Управление изображениями и файлами</p>
          </div>

          <div className="p-6 rounded-lg shadow-md bg-gray-50">
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
