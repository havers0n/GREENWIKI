import React, { useEffect } from 'react';

export interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
  isOpen?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ title, children, onClose, className = '', isOpen = true }) => {
  useEffect(() => {
    if (isOpen) {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', onKeyDown);
      return () => document.removeEventListener('keydown', onKeyDown);
    }
  }, [onClose, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60" onClick={onClose} />
      <div className="relative z-10 flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={`w-full max-w-2xl rounded-xl bg-white dark:bg-gray-900 shadow-xl p-6 ${className}`}
        >
          <div className="mb-4 flex items-start justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
            <button
              type="button"
              aria-label="Close"
              className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};


