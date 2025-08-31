import React, { useState, useMemo } from 'react';
import { Card, Typography, Button } from '@my-forum/ui';

/**
 * Тестовая страница для измерения производительности рендеринга блоков
 * Создает 200 простых текстовых блоков для тестирования производительности
 */
const PerformanceTestPage: React.FC = () => {
  const [renderTime, setRenderTime] = useState<number>(0);
  const [updateTime, setUpdateTime] = useState<number>(0);
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [blocks, setBlocks] = useState(() =>
    Array.from({ length: 200 }, (_, index) => ({
      id: `block-${index}`,
      content: `Тестовый блок #${index + 1}`,
      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`, // Разные цвета для визуального отличия
    }))
  );

  // Измерение времени первого рендера
  const measureInitialRender = () => {
    setIsMeasuring(true);
    const startTime = performance.now();

    // Принудительно вызываем перерендер
    setBlocks(prevBlocks => [...prevBlocks]);

    setTimeout(() => {
      const endTime = performance.now();
      setRenderTime(endTime - startTime);
      setIsMeasuring(false);
    }, 100);
  };

  // Измерение времени обновления одного блока
  const measureUpdateTime = () => {
    setIsMeasuring(true);
    const startTime = performance.now();

    // Обновляем содержимое блока в середине списка
    setBlocks(prevBlocks => {
      const newBlocks = [...prevBlocks];
      const middleIndex = Math.floor(newBlocks.length / 2);
      newBlocks[middleIndex] = {
        ...newBlocks[middleIndex],
        content: `Обновленный блок #${middleIndex + 1} (${new Date().getTime()})`,
      };
      return newBlocks;
    });

    setTimeout(() => {
      const endTime = performance.now();
      setUpdateTime(endTime - startTime);
      setIsMeasuring(false);
    }, 100);
  };

  // Генерация блоков с мемоизацией для оптимизации
  const renderedBlocks = useMemo(() =>
    blocks.map((block) => (
      <Card
        key={block.id}
        className="p-4 mb-2"
        style={{ borderLeft: `4px solid ${block.color}` }}
      >
        <Typography variant="body" className="text-gray-700">
          {block.content}
        </Typography>
      </Card>
    )),
    [blocks]
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Typography variant="h1" className="text-3xl font-bold mb-4">
          Тест Производительности - 200 Блоков
        </Typography>

        <Typography variant="body" className="text-gray-600 mb-6">
          Эта страница создана для измерения базовой производительности рендеринга 200 блоков.
          Используйте инструменты разработчика браузера для профилирования производительности.
        </Typography>

        <div className="flex gap-4 mb-6">
          <Button
            onClick={measureInitialRender}
            disabled={isMeasuring}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
          >
            {isMeasuring ? 'Измерение...' : 'Измерить Первый Рендер'}
          </Button>

          <Button
            onClick={measureUpdateTime}
            disabled={isMeasuring}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded"
          >
            {isMeasuring ? 'Измерение...' : 'Измерить Обновление'}
          </Button>

          <Button
            onClick={() => {
              setRenderTime(0);
              setUpdateTime(0);
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
          >
            Сбросить Метрики
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <Typography variant="h3" className="text-xl font-semibold mb-2">
              Метрики Производительности
            </Typography>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Первый рендер:</span>
                <span className="font-mono font-bold">
                  {renderTime > 0 ? `${renderTime.toFixed(2)}ms` : 'Не измерено'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Обновление блока:</span>
                <span className="font-mono font-bold">
                  {updateTime > 0 ? `${updateTime.toFixed(2)}ms` : 'Не измерено'}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <Typography variant="h3" className="text-xl font-semibold mb-2">
              Инструкции по Тестированию
            </Typography>
            <div className="space-y-2 text-sm text-gray-600">
              <p>1. Откройте DevTools (F12)</p>
              <p>2. Перейдите во вкладку Performance</p>
              <p>3. Нажмите "Start Recording"</p>
              <p>4. Выполните тесты выше</p>
              <p>5. Остановите запись и проанализируйте</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="mb-8">
        <Typography variant="h2" className="text-2xl font-semibold mb-4">
          Рендер 200 Блоков
        </Typography>

        <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
          {renderedBlocks}
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <Typography variant="body" className="text-yellow-800">
          <strong>Примечание:</strong> Эта страница используется только для измерения базовой производительности.
          После внедрения виртуализации эти метрики будут сравнены с новыми для оценки улучшений.
        </Typography>
      </div>
    </div>
  );
};

export default PerformanceTestPage;
