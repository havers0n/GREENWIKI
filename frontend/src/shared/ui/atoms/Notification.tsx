import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // в миллисекундах
  onClose: (id: string) => void;
  className?: string;
}

/**
 * Компонент уведомления с анимацией и авто-закрытием
 */
export const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  className
}) => {
  // Автоматическое закрытие через указанное время
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        duration: 0.3
      }}
      className={cn(
        'relative flex items-start p-4 mb-3 rounded-lg border shadow-sm max-w-md',
        getBackgroundColor(),
        className
      )}
    >
      <div className="flex-shrink-0 mr-3">
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {title}
        </h4>
        {message && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {message}
          </p>
        )}
      </div>

      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 ml-3 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        aria-label="Закрыть уведомление"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </motion.div>
  );
};
