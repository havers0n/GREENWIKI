import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { NotificationType } from '../ui/atoms/Notification';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextValue {
  notifications: NotificationItem[];
  showNotification: (notification: Omit<NotificationItem, 'id'>) => void;
  hideNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

/**
 * Провайдер контекста для управления уведомлениями
 */
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const showNotification = useCallback((notification: Omit<NotificationItem, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: NotificationItem = {
      id,
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextValue = {
    notifications,
    showNotification,
    hideNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Хук для использования уведомлений
 */
export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

/**
 * Хук для быстрого показа уведомлений разных типов
 */
export const useNotificationActions = () => {
  const { showNotification } = useNotifications();

  const success = useCallback((title: string, message?: string, duration?: number) => {
    showNotification({ type: 'success', title, message, duration });
  }, [showNotification]);

  const error = useCallback((title: string, message?: string, duration?: number) => {
    showNotification({ type: 'error', title, message, duration });
  }, [showNotification]);

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    showNotification({ type: 'warning', title, message, duration });
  }, [showNotification]);

  const info = useCallback((title: string, message?: string, duration?: number) => {
    showNotification({ type: 'info', title, message, duration });
  }, [showNotification]);

  return { success, error, warning, info };
};
