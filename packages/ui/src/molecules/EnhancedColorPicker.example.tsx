import React, { useState } from 'react';
import { EnhancedColorPicker } from './EnhancedColorPicker';
import { InspectorField } from './InspectorField';

/**
 * Пример использования EnhancedColorPicker
 * Этот файл демонстрирует различные варианты использования компонента
 */
export const EnhancedColorPickerExample: React.FC = () => {
  const [colors, setColors] = useState({
    primary: '#ff6b6b',
    secondary: 'rgba(78, 205, 196, 0.8)',
    accent: '#45b7d1',
    text: '#333333'
  });

  const handleColorChange = (key: keyof typeof colors, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const presetColors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',
    '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'
  ];

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        EnhancedColorPicker - Примеры использования
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Базовый пример */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Базовый пример
          </h2>
          <InspectorField label="Основной цвет">
            <EnhancedColorPicker
              value={colors.primary}
              onChange={(value) => handleColorChange('primary', value)}
            />
          </InspectorField>
        </div>

        {/* С прозрачностью */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            С поддержкой прозрачности
          </h2>
          <InspectorField label="Цвет с альфа-каналом">
            <EnhancedColorPicker
              value={colors.secondary}
              onChange={(value) => handleColorChange('secondary', value)}
              showAlpha={true}
            />
          </InspectorField>
        </div>

        {/* С предустановками */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            С предустановленными цветами
          </h2>
          <InspectorField label="Акцентный цвет">
            <EnhancedColorPicker
              value={colors.accent}
              onChange={(value) => handleColorChange('accent', value)}
              presets={presetColors}
            />
          </InspectorField>
        </div>

        {/* Полный пример */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Полный пример
          </h2>
          <InspectorField label="Цвет текста">
            <EnhancedColorPicker
              value={colors.text}
              onChange={(value) => handleColorChange('text', value)}
              showAlpha={true}
              presets={['#000000', '#333333', '#666666', '#999999', '#ffffff']}
              placeholder="Выберите цвет текста"
            />
          </InspectorField>
        </div>
      </div>

      {/* Предпросмотр */}
      <div className="mt-8 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Предпросмотр
        </h2>
        <div
          className="p-6 rounded-lg text-white text-center"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            border: `2px solid ${colors.accent}`,
          }}
        >
          <h3
            className="text-xl font-bold mb-2"
            style={{ color: colors.text }}
          >
            Заголовок с выбранными цветами
          </h3>
          <p style={{ color: colors.text, opacity: 0.8 }}>
            Этот текст использует выбранный цвет текста с поддержкой прозрачности
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Основной цвет:</strong> {colors.primary}
          </div>
          <div>
            <strong>Цвет с прозрачностью:</strong> {colors.secondary}
          </div>
          <div>
            <strong>Акцентный цвет:</strong> {colors.accent}
          </div>
          <div>
            <strong>Цвет текста:</strong> {colors.text}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedColorPickerExample;
