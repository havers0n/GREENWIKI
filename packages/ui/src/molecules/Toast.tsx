import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  action
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    setIsVisible(true);

    // Auto close after duration
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match transition duration
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400',
  };

  const IconComponent = icons[type];

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-md rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out',
        colors[type],
        isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {React.createElement(IconComponent as any, { className: "h-6 w-6" })}
        </div>

        <div className="ml-3 flex-1">
          {title && (
            <p className="text-sm font-medium">
              {title}
            </p>
          )}

          <p className="text-sm">
            {message}
          </p>

          {action && (
            <div className="mt-3">
              <button
                type="button"
                onClick={action.onClick}
                className="text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {action.label}
              </button>
            </div>
          )}
        </div>

        <div className="ml-auto pl-3">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {React.createElement(X as any, { className: "h-5 w-5" })}
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast Container Component
export interface ToastContainerProps {
  toasts: Omit<ToastProps, 'onClose'>[];
  onRemoveToast: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemoveToast,
  position = 'top-right'
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-3 pointer-events-none',
        positionClasses[position]
      )}
      aria-live="polite"
      aria-label="Уведомления"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onRemoveToast}
        />
      ))}
    </div>
  );
};

// Toast Hook for easy usage
export interface ToastOptions {
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onClose'>[]>([]);

  const addToast = (options: ToastOptions) => {
    const id = Date.now().toString();
    const newToast: Omit<ToastProps, 'onClose'> = {
      id,
      ...options,
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) =>
    addToast({ ...options, type: 'success', message });

  const error = (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) =>
    addToast({ ...options, type: 'error', message });

  const warning = (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) =>
    addToast({ ...options, type: 'warning', message });

  const info = (message: string, options?: Omit<ToastOptions, 'type' | 'message'>) =>
    addToast({ ...options, type: 'info', message });

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};
