import React, { useEffect, useRef } from 'react';

export const ModalSize = {
  Sm: 'sm',
  Md: 'md',
  Lg: 'lg',
  Xl: 'xl',
} as const;
export type ModalSize = typeof ModalSize[keyof typeof ModalSize];

export interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
  isOpen?: boolean;
  size?: ModalSize;
  closeOnEscape?: boolean;
  closeOnOverlay?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  children,
  onClose,
  className = '',
  isOpen = true,
  size = ModalSize.Md,
  closeOnEscape = true,
  closeOnOverlay = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, isOpen, closeOnEscape]);

  if (!isOpen) return null;

  const sizeClassMap: Record<ModalSize, string> = {
    [ModalSize.Sm]: 'max-w-sm',
    [ModalSize.Md]: 'max-w-2xl',
    [ModalSize.Lg]: 'max-w-4xl',
    [ModalSize.Xl]: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60"
        onClick={closeOnOverlay ? onClose : undefined}
      />
      <div className="relative z-10 flex min-h-full items-center justify-center p-4">
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className={`w-full ${sizeClassMap[size]} rounded-xl bg-white dark:bg-gray-900 shadow-xl p-6 ${className}`}
        >
          <div className="mb-4 flex items-start justify-between">
            <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
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


