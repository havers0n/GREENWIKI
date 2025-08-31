import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Notification } from './Notification';
import { useNotifications } from '../contexts/NotificationContext';
import { cn } from '../lib/utils';

interface NotificationContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
  className?: string;
}

/**
 * Контейнер для отображения уведомлений
 * Используется в корневом компоненте приложения
 */
export const NotificationContainer: React.FC<NotificationContainerProps> = ({
  position = 'top-right',
  className
}) => {
  const { notifications, hideNotification } = useNotifications();

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed z-50 pointer-events-none',
        getPositionClasses(),
        className
      )}
    >
      <div className="space-y-2 max-w-sm">
        <AnimatePresence>
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              id={notification.id}
              type={notification.type}
              title={notification.title}
              message={notification.message}
              onClose={hideNotification}
              className="pointer-events-auto"
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
