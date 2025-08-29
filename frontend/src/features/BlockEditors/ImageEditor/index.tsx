import React from 'react';
import { Input } from 'shared/ui/atoms';

interface ImageData {
  imageUrl: string;
  altText: string;
}

interface ImageEditorProps {
  data: ImageData;
  onChange: (data: ImageData) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <Input
        label="URL изображения"
        value={data.imageUrl}
        onChange={(e) => onChange({ ...data, imageUrl: e.target.value })}
        placeholder="https://example.com/image.jpg"
        type="url"
      />
      
      <Input
        label="Альтернативный текст"
        value={data.altText}
        onChange={(e) => onChange({ ...data, altText: e.target.value })}
        placeholder="Описание изображения для доступности"
      />
      
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded p-2">
        <strong>Совет:</strong> Альтернативный текст помогает людям с нарушениями зрения понять содержание изображения.
      </div>
    </div>
  );
};

export default ImageEditor;
