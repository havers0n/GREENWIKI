// Пример использования нового Icon компонента
import React from 'react';
import { Button, Icon } from '@my-forum/ui';
import { LogIn, ArrowRight, Mail, Search } from 'lucide-react';

export const TestIconUsage = () => {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Тестирование нового Icon компонента</h1>

      {/* Button с иконками */}
      <div className="space-x-4">
        <Button leftIcon={LogIn}>
          Войти
        </Button>

        <Button variant="secondary" rightIcon={ArrowRight}>
          Далее
        </Button>

        <Button variant="ghost" leftIcon={Mail}>
          Отправить email
        </Button>
      </div>

      {/* Отдельные иконки */}
      <div className="flex space-x-4">
        <Icon icon={Search} size={20} className="text-blue-500" />
        <Icon icon={Mail} size={24} className="text-green-500" />
        <Icon icon={LogIn} size={16} className="text-red-500" />
      </div>

      {/* Иконки с разными размерами */}
      <div className="flex items-center space-x-2">
        <Icon icon={ArrowRight} size={12} />
        <Icon icon={ArrowRight} size={16} />
        <Icon icon={ArrowRight} size={20} />
        <Icon icon={ArrowRight} size={24} />
      </div>
    </div>
  );
};
